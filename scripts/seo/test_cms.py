from __future__ import annotations

import io
import json
import os
import threading
import unittest
import urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
from unittest.mock import mock_open, patch

import cms


def wire_post(**fields):
    return {**fields, "_cmsFields": list(fields)}


def response(result=None, **envelope):
    return io.BytesIO(json.dumps({"data": {"result": result}, **envelope}).encode())


class CMSGraphQLTests(unittest.TestCase):
    def setUp(self):
        self.key = patch.dict(os.environ, {"CMS_API_KEY": "seo-test-key"})
        self.key.start()
        self.addCleanup(self.key.stop)
        self.base = patch.object(cms, "CMS_URL", "https://cms.example/nested/")
        self.base.start()
        self.addCleanup(self.base.stop)
        self.open_patch = patch.object(cms._opener, "open")
        self.open = self.open_patch.start()
        self.addCleanup(self.open_patch.stop)

    def packet(self, index=0):
        request = self.open.call_args_list[index].args[0]
        self.assertEqual(request.full_url, "https://cms.example/api/graphql")
        self.assertEqual(request.method, "POST")
        self.assertEqual(request.get_header("Authorization"), "Bearer seo-test-key")
        self.assertEqual(request.get_header("Accept"), "application/graphql-response+json")
        return json.loads(request.data)

    def test_slug_is_a_variable_and_omitted_fields_stay_omitted(self):
        self.open.return_value = response({
            "docs": [{**wire_post(id=7, slug='a"/?&', content="Body"), "seoTitle": None}],
            "hasNextPage": False,
        })
        self.assertEqual(cms.get_post('a"/?&'), {"id": 7, "slug": 'a"/?&', "content": "Body"})
        packet = self.packet()
        self.assertEqual(packet["operationName"], "SEOPosts")
        self.assertEqual(packet["variables"], {
            "where": {"slug": {"equals": 'a"/?&'}}, "page": 1, "limit": 1,
        })
        self.assertNotIn('a"/?&', packet["query"])

    def test_missing_post_keeps_the_command_line_failure(self):
        self.open.return_value = response({"docs": [], "hasNextPage": False})
        with self.assertRaisesRegex(SystemExit, "post not found: missing"):
            cms.get_post("missing")

    def test_missing_credentials_stop_before_any_network_request(self):
        with patch.dict(os.environ, {"CMS_API_KEY": ""}), patch(
            "cms.os.path.exists", return_value=False,
        ):
            with self.assertRaisesRegex(SystemExit, "CMS_API_KEY not found"):
                cms.get_post("missing")
        self.open.assert_not_called()

    def test_existing_local_env_key_fallback_is_preserved(self):
        self.open.return_value = response({"docs": [], "hasNextPage": False})
        with patch.dict(os.environ, {"CMS_API_KEY": ""}), patch(
            "cms.os.path.exists", return_value=True,
        ), patch("builtins.open", mock_open(read_data='CMS_API_KEY="file-test-key"\n')):
            self.assertEqual(cms.all_posts(), [])
        request = self.open.call_args.args[0]
        self.assertEqual(request.get_header("Authorization"), "Bearer file-test-key")

    def test_all_posts_follows_every_page_without_published_only_filtering(self):
        self.open.side_effect = [
            response({"docs": [wire_post(id=1, _status="draft")], "hasNextPage": True, "nextPage": 2}),
            response({"docs": [wire_post(id=2, _status="published", archivedAt="2026-10-01")], "hasNextPage": False}),
        ]
        self.assertEqual([post["id"] for post in cms.all_posts()], [1, 2])
        self.assertEqual(self.packet(0)["variables"], {"where": None, "page": 1, "limit": 100})
        self.assertEqual(self.packet(1)["variables"]["page"], 2)

    def test_pagination_can_advance_without_next_page(self):
        self.open.side_effect = [
            response({"docs": [], "hasNextPage": True, "nextPage": None}),
            response({"docs": [], "hasNextPage": False}),
        ]
        self.assertEqual(cms.all_posts(), [])
        self.assertEqual(self.packet(1)["variables"]["page"], 2)

    def test_nonadvancing_pagination_stops_instead_of_looping(self):
        self.open.return_value = response({"docs": [], "hasNextPage": True, "nextPage": 1})
        with self.assertRaises(cms.CMSRequestError):
            cms.all_posts()
        self.assertEqual(self.open.call_count, 1)

    def test_patch_keeps_selected_fields_id_and_document_envelope(self):
        self.open.return_value = response(wire_post(id=7, content="New", seoDescription="SEO"))
        fields = {"content": "New", "seoDescription": "SEO"}
        self.assertEqual(cms.patch_post(7, fields), {"doc": {"id": 7, **fields}})
        packet = self.packet()
        self.assertEqual(packet["operationName"], "SEOUpdatePost")
        self.assertEqual(packet["variables"], {"id": "7", "data": fields})
        self.assertNotIn("_status", packet["variables"]["data"])
        self.assertNotIn("draft", packet["variables"])
        self.assertEqual(self.open.call_count, 1)

    def test_declared_rejection_inside_http_200_aborts_the_write(self):
        self.open.return_value = response(errors=[{
            "message": "Do not print arbitrary upstream data",
            "path": ["result"],
            "extensions": {"statusCode": 403, "outcome": "rejected"},
        }])
        with self.assertRaises(cms.CMSRequestError) as caught:
            cms.patch_post("7", {"content": "Private draft"})
        self.assertEqual((caught.exception.status, caught.exception.outcome), (403, "rejected"))
        self.assertNotIn("Private draft", str(caught.exception))
        self.assertNotIn("upstream", str(caught.exception))
        self.assertEqual(self.open.call_count, 1)

    def test_partial_mutation_is_uncertain_even_with_a_rejected_field(self):
        self.open.return_value = response(wire_post(id=7), errors=[{
            "message": "Related field failed",
            "extensions": {"statusCode": 403, "outcome": "rejected"},
        }])
        with self.assertRaises(cms.CMSRequestError) as caught:
            cms.patch_post(7, {"content": "New"})
        self.assertEqual(caught.exception.outcome, "unknown")
        self.assertIn("Check the post", str(caught.exception))
        self.assertEqual(self.open.call_count, 1)

    def test_failed_read_does_not_become_an_empty_post_list(self):
        self.open.return_value = response(errors=[{
            "message": "Unavailable", "extensions": {"statusCode": 503},
        }])
        with self.assertRaises(cms.CMSRequestError) as caught:
            cms.all_posts()
        self.assertEqual((caught.exception.status, caught.exception.outcome), (503, "read-failed"))

    def test_network_failure_never_retries_or_falls_back_to_rest(self):
        self.open.side_effect = urllib.error.URLError("network unavailable")
        with self.assertRaises(cms.CMSRequestError) as caught:
            cms.patch_post(7, {"content": "New"})
        self.assertEqual(caught.exception.outcome, "unknown")
        self.assertEqual(self.open.call_count, 1)
        self.packet()

    def test_http_statuses_distinguish_rejection_from_uncertain_writes(self):
        for status, outcome in [(400, "rejected"), (403, "rejected"), (408, "unknown"), (503, "unknown")]:
            with self.subTest(status=status):
                self.open.side_effect = urllib.error.HTTPError(
                    "https://cms.example/api/graphql", status, "Failure", {}, io.BytesIO(b"secret"),
                )
                with self.assertRaises(cms.CMSRequestError) as caught:
                    cms.patch_post(7, {"content": "New"})
                self.assertEqual((caught.exception.status, caught.exception.outcome), (status, outcome))
                self.assertNotIn("secret", str(caught.exception))

    def test_malformed_responses_never_confirm_an_update(self):
        for body in [b"not JSON", b"[]", b'{}', b'{"errors": {}}', b'{"data":{"result":{}}}']:
            with self.subTest(body=body):
                self.open.side_effect = None
                self.open.return_value = io.BytesIO(body)
                with self.assertRaises(cms.CMSRequestError) as caught:
                    cms.patch_post(7, {"content": "New"})
                self.assertEqual((caught.exception.status, caught.exception.outcome), (502, "unknown"))

    def test_redirects_are_not_followed_with_credentials(self):
        received = []

        class Redirect(BaseHTTPRequestHandler):
            def do_POST(self):
                received.append(self.path)
                self.send_response(302)
                self.send_header("Location", "/should-not-receive-credentials")
                self.end_headers()

            def do_GET(self):
                received.append(self.path)
                self.send_response(200)
                self.end_headers()

            def log_message(self, *args):
                pass

        server = HTTPServer(("127.0.0.1", 0), Redirect)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.open_patch.stop()
        cms.CMS_URL = f"http://127.0.0.1:{server.server_port}"
        try:
            with self.assertRaises(cms.CMSRequestError):
                cms.patch_post(7, {"content": "New"})
            self.assertEqual(received, ["/api/graphql"])
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_markdown_replacements_keep_code_blocks_untouched(self):
        content = "old `old`\n```sh\nold\n```\nold"
        updated, _ = cms.replace_outside_code(content, [("old", "new")])
        self.assertEqual(updated, "new `old`\n```sh\nold\n```\nnew")


if __name__ == "__main__":
    unittest.main()
