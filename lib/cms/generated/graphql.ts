/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Category_createdAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Category_description_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Category_id_operator = {
  equals?: number | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: number | null | undefined;
  greater_than_equal?: number | null | undefined;
  less_than?: number | null | undefined;
  less_than_equal?: number | null | undefined;
  not_equals?: number | null | undefined;
};

export type Category_order_operator = {
  equals?: number | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: number | null | undefined;
  greater_than_equal?: number | null | undefined;
  less_than?: number | null | undefined;
  less_than_equal?: number | null | undefined;
  not_equals?: number | null | undefined;
};

export type Category_seoDescription_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Category_seoTitle_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Category_showInNavigation_operator = {
  equals?: boolean | null | undefined;
  exists?: boolean | null | undefined;
  not_equals?: boolean | null | undefined;
};

export type Category_slug_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Category_title_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Category_updatedAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Category_visible_operator = {
  equals?: boolean | null | undefined;
  exists?: boolean | null | undefined;
  not_equals?: boolean | null | undefined;
};

export type Category_where = {
  AND?: Array<Category_where_and | null | undefined> | null | undefined;
  OR?: Array<Category_where_or | null | undefined> | null | undefined;
  createdAt?: Category_createdAt_operator | null | undefined;
  description?: Category_description_operator | null | undefined;
  id?: Category_id_operator | null | undefined;
  order?: Category_order_operator | null | undefined;
  seoDescription?: Category_seoDescription_operator | null | undefined;
  seoTitle?: Category_seoTitle_operator | null | undefined;
  showInNavigation?: Category_showInNavigation_operator | null | undefined;
  slug?: Category_slug_operator | null | undefined;
  title?: Category_title_operator | null | undefined;
  updatedAt?: Category_updatedAt_operator | null | undefined;
  visible?: Category_visible_operator | null | undefined;
};

export type Category_where_and = {
  AND?: Array<Category_where_and | null | undefined> | null | undefined;
  OR?: Array<Category_where_or | null | undefined> | null | undefined;
  createdAt?: Category_createdAt_operator | null | undefined;
  description?: Category_description_operator | null | undefined;
  id?: Category_id_operator | null | undefined;
  order?: Category_order_operator | null | undefined;
  seoDescription?: Category_seoDescription_operator | null | undefined;
  seoTitle?: Category_seoTitle_operator | null | undefined;
  showInNavigation?: Category_showInNavigation_operator | null | undefined;
  slug?: Category_slug_operator | null | undefined;
  title?: Category_title_operator | null | undefined;
  updatedAt?: Category_updatedAt_operator | null | undefined;
  visible?: Category_visible_operator | null | undefined;
};

export type Category_where_or = {
  AND?: Array<Category_where_and | null | undefined> | null | undefined;
  OR?: Array<Category_where_or | null | undefined> | null | undefined;
  createdAt?: Category_createdAt_operator | null | undefined;
  description?: Category_description_operator | null | undefined;
  id?: Category_id_operator | null | undefined;
  order?: Category_order_operator | null | undefined;
  seoDescription?: Category_seoDescription_operator | null | undefined;
  seoTitle?: Category_seoTitle_operator | null | undefined;
  showInNavigation?: Category_showInNavigation_operator | null | undefined;
  slug?: Category_slug_operator | null | undefined;
  title?: Category_title_operator | null | undefined;
  updatedAt?: Category_updatedAt_operator | null | undefined;
  visible?: Category_visible_operator | null | undefined;
};

export type Post__status =
  | 'draft'
  | 'published';

export type Post__status_Input =
  | 'draft'
  | 'published';

export type Post__status_operator = {
  all?: Array<Post__status_Input | null | undefined> | null | undefined;
  equals?: Post__status_Input | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<Post__status_Input | null | undefined> | null | undefined;
  not_equals?: Post__status_Input | null | undefined;
  not_in?: Array<Post__status_Input | null | undefined> | null | undefined;
};

export type Post_archivedAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_archivedBy_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_authors_operator = {
  all?: Array<unknown> | null | undefined;
  contains?: unknown;
  equals?: unknown;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_category_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_composerOrigin_operator = {
  contains?: unknown;
  equals?: unknown;
  exists?: boolean | null | undefined;
  intersects?: unknown;
  like?: unknown;
  not_equals?: unknown;
  within?: unknown;
};

export type Post_content_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_createdAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_createdBy_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_description_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_externalAuthor_operator = {
  equals?: boolean | null | undefined;
  exists?: boolean | null | undefined;
  not_equals?: boolean | null | undefined;
};

export type Post_featuredImage_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_featured_operator = {
  equals?: boolean | null | undefined;
  exists?: boolean | null | undefined;
  not_equals?: boolean | null | undefined;
};

export type Post_growthEstimate_operator = {
  contains?: unknown;
  equals?: unknown;
  exists?: boolean | null | undefined;
  intersects?: unknown;
  like?: unknown;
  not_equals?: unknown;
  within?: unknown;
};

export type Post_id_operator = {
  equals?: number | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: number | null | undefined;
  greater_than_equal?: number | null | undefined;
  less_than?: number | null | undefined;
  less_than_equal?: number | null | undefined;
  not_equals?: number | null | undefined;
};

export type Post_importHash_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_launch_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_legacyUrl_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_notionId_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_planningProblem_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_publishedAt_operator = {
  equals?: string | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_reviewApprovedAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_reviewApprovedBy_Relation = {
  relationTo?: Post_reviewApprovedBy_Relation_RelationTo | null | undefined;
  value?: unknown;
};

export type Post_reviewApprovedBy_Relation_RelationTo =
  | 'api_keys'
  | 'users';

export type Post_reviewRequestMessage_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_reviewRequestedAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_reviewRequestedBy_Relation = {
  relationTo?: Post_reviewRequestedBy_Relation_RelationTo | null | undefined;
  value?: unknown;
};

export type Post_reviewRequestedBy_Relation_RelationTo =
  | 'api_keys'
  | 'users';

export type Post_reviewStatus_Input =
  | 'approved'
  | 'in_review'
  | 'not_requested';

export type Post_reviewStatus_operator = {
  all?: Array<Post_reviewStatus_Input | null | undefined> | null | undefined;
  equals?: Post_reviewStatus_Input | null | undefined;
  in?: Array<Post_reviewStatus_Input | null | undefined> | null | undefined;
  not_equals?: Post_reviewStatus_Input | null | undefined;
  not_in?: Array<Post_reviewStatus_Input | null | undefined> | null | undefined;
};

export type Post_seoDescription_operator = {
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_seoTitle_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_sharedWith_operator = {
  all?: Array<unknown> | null | undefined;
  contains?: unknown;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_slug_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_socialImage_operator = {
  all?: Array<unknown> | null | undefined;
  equals?: unknown;
  exists?: boolean | null | undefined;
  in?: Array<unknown> | null | undefined;
  not_equals?: unknown;
  not_in?: Array<unknown> | null | undefined;
};

export type Post_title_operator = {
  all?: Array<string | null | undefined> | null | undefined;
  contains?: string | null | undefined;
  equals?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
  not_in?: Array<string | null | undefined> | null | undefined;
};

export type Post_updatedAt_operator = {
  equals?: string | null | undefined;
  exists?: boolean | null | undefined;
  greater_than?: string | null | undefined;
  greater_than_equal?: string | null | undefined;
  less_than?: string | null | undefined;
  less_than_equal?: string | null | undefined;
  like?: string | null | undefined;
  not_equals?: string | null | undefined;
};

export type Post_where = {
  AND?: Array<Post_where_and | null | undefined> | null | undefined;
  OR?: Array<Post_where_or | null | undefined> | null | undefined;
  _status?: Post__status_operator | null | undefined;
  archivedAt?: Post_archivedAt_operator | null | undefined;
  archivedBy?: Post_archivedBy_operator | null | undefined;
  authors?: Post_authors_operator | null | undefined;
  category?: Post_category_operator | null | undefined;
  composerOrigin?: Post_composerOrigin_operator | null | undefined;
  content?: Post_content_operator | null | undefined;
  createdAt?: Post_createdAt_operator | null | undefined;
  createdBy?: Post_createdBy_operator | null | undefined;
  description?: Post_description_operator | null | undefined;
  externalAuthor?: Post_externalAuthor_operator | null | undefined;
  featured?: Post_featured_operator | null | undefined;
  featuredImage?: Post_featuredImage_operator | null | undefined;
  growthEstimate?: Post_growthEstimate_operator | null | undefined;
  id?: Post_id_operator | null | undefined;
  importHash?: Post_importHash_operator | null | undefined;
  launch?: Post_launch_operator | null | undefined;
  legacyUrl?: Post_legacyUrl_operator | null | undefined;
  notionId?: Post_notionId_operator | null | undefined;
  planningProblem?: Post_planningProblem_operator | null | undefined;
  publishedAt?: Post_publishedAt_operator | null | undefined;
  reviewApprovedAt?: Post_reviewApprovedAt_operator | null | undefined;
  reviewApprovedBy?: Post_reviewApprovedBy_Relation | null | undefined;
  reviewRequestMessage?: Post_reviewRequestMessage_operator | null | undefined;
  reviewRequestedAt?: Post_reviewRequestedAt_operator | null | undefined;
  reviewRequestedBy?: Post_reviewRequestedBy_Relation | null | undefined;
  reviewStatus?: Post_reviewStatus_operator | null | undefined;
  seoDescription?: Post_seoDescription_operator | null | undefined;
  seoTitle?: Post_seoTitle_operator | null | undefined;
  sharedWith?: Post_sharedWith_operator | null | undefined;
  slug?: Post_slug_operator | null | undefined;
  socialImage?: Post_socialImage_operator | null | undefined;
  title?: Post_title_operator | null | undefined;
  updatedAt?: Post_updatedAt_operator | null | undefined;
};

export type Post_where_and = {
  AND?: Array<Post_where_and | null | undefined> | null | undefined;
  OR?: Array<Post_where_or | null | undefined> | null | undefined;
  _status?: Post__status_operator | null | undefined;
  archivedAt?: Post_archivedAt_operator | null | undefined;
  archivedBy?: Post_archivedBy_operator | null | undefined;
  authors?: Post_authors_operator | null | undefined;
  category?: Post_category_operator | null | undefined;
  composerOrigin?: Post_composerOrigin_operator | null | undefined;
  content?: Post_content_operator | null | undefined;
  createdAt?: Post_createdAt_operator | null | undefined;
  createdBy?: Post_createdBy_operator | null | undefined;
  description?: Post_description_operator | null | undefined;
  externalAuthor?: Post_externalAuthor_operator | null | undefined;
  featured?: Post_featured_operator | null | undefined;
  featuredImage?: Post_featuredImage_operator | null | undefined;
  growthEstimate?: Post_growthEstimate_operator | null | undefined;
  id?: Post_id_operator | null | undefined;
  importHash?: Post_importHash_operator | null | undefined;
  launch?: Post_launch_operator | null | undefined;
  legacyUrl?: Post_legacyUrl_operator | null | undefined;
  notionId?: Post_notionId_operator | null | undefined;
  planningProblem?: Post_planningProblem_operator | null | undefined;
  publishedAt?: Post_publishedAt_operator | null | undefined;
  reviewApprovedAt?: Post_reviewApprovedAt_operator | null | undefined;
  reviewApprovedBy?: Post_reviewApprovedBy_Relation | null | undefined;
  reviewRequestMessage?: Post_reviewRequestMessage_operator | null | undefined;
  reviewRequestedAt?: Post_reviewRequestedAt_operator | null | undefined;
  reviewRequestedBy?: Post_reviewRequestedBy_Relation | null | undefined;
  reviewStatus?: Post_reviewStatus_operator | null | undefined;
  seoDescription?: Post_seoDescription_operator | null | undefined;
  seoTitle?: Post_seoTitle_operator | null | undefined;
  sharedWith?: Post_sharedWith_operator | null | undefined;
  slug?: Post_slug_operator | null | undefined;
  socialImage?: Post_socialImage_operator | null | undefined;
  title?: Post_title_operator | null | undefined;
  updatedAt?: Post_updatedAt_operator | null | undefined;
};

export type Post_where_or = {
  AND?: Array<Post_where_and | null | undefined> | null | undefined;
  OR?: Array<Post_where_or | null | undefined> | null | undefined;
  _status?: Post__status_operator | null | undefined;
  archivedAt?: Post_archivedAt_operator | null | undefined;
  archivedBy?: Post_archivedBy_operator | null | undefined;
  authors?: Post_authors_operator | null | undefined;
  category?: Post_category_operator | null | undefined;
  composerOrigin?: Post_composerOrigin_operator | null | undefined;
  content?: Post_content_operator | null | undefined;
  createdAt?: Post_createdAt_operator | null | undefined;
  createdBy?: Post_createdBy_operator | null | undefined;
  description?: Post_description_operator | null | undefined;
  externalAuthor?: Post_externalAuthor_operator | null | undefined;
  featured?: Post_featured_operator | null | undefined;
  featuredImage?: Post_featuredImage_operator | null | undefined;
  growthEstimate?: Post_growthEstimate_operator | null | undefined;
  id?: Post_id_operator | null | undefined;
  importHash?: Post_importHash_operator | null | undefined;
  launch?: Post_launch_operator | null | undefined;
  legacyUrl?: Post_legacyUrl_operator | null | undefined;
  notionId?: Post_notionId_operator | null | undefined;
  planningProblem?: Post_planningProblem_operator | null | undefined;
  publishedAt?: Post_publishedAt_operator | null | undefined;
  reviewApprovedAt?: Post_reviewApprovedAt_operator | null | undefined;
  reviewApprovedBy?: Post_reviewApprovedBy_Relation | null | undefined;
  reviewRequestMessage?: Post_reviewRequestMessage_operator | null | undefined;
  reviewRequestedAt?: Post_reviewRequestedAt_operator | null | undefined;
  reviewRequestedBy?: Post_reviewRequestedBy_Relation | null | undefined;
  reviewStatus?: Post_reviewStatus_operator | null | undefined;
  seoDescription?: Post_seoDescription_operator | null | undefined;
  seoTitle?: Post_seoTitle_operator | null | undefined;
  sharedWith?: Post_sharedWith_operator | null | undefined;
  slug?: Post_slug_operator | null | undefined;
  socialImage?: Post_socialImage_operator | null | undefined;
  title?: Post_title_operator | null | undefined;
  updatedAt?: Post_updatedAt_operator | null | undefined;
};

export type BlogMediaFieldsFragment = { id: number, alt: string, height: number | null, mimeType: string | null, url: string | null, width: number | null };

export type BlogAuthorFieldsFragment = { id: number, name: string, slug: string, title: string | null, githubUrl: string | null, avatar: { id: number, alt: string, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null };

export type BlogCategoryFieldsFragment = { id: number, title: string, slug: string, description: string | null, order: number | null, seoDescription: string | null, seoTitle: string | null, showInNavigation: boolean | null, visible: boolean | null };

export type BlogPostsQueryVariables = Exact<{
  page: number;
  limit: number;
  sort: string;
  where?: Post_where | null | undefined;
  includeContent: boolean;
}>;


export type BlogPostsQuery = { result: { hasNextPage: boolean, nextPage: number | null, docs: Array<{ id: number, _status: Post__status | null, archivedAt: string | null, title: string | null, slug: string | null, description: string | null, publishedAt: string | null, createdAt: string | null, updatedAt: string | null, externalAuthor: boolean | null, featured: boolean | null, seoTitle: string | null, seoDescription: string | null, content?: string | null, authors: Array<{ id: number, name: string, slug: string, title: string | null, githubUrl: string | null, avatar: { id: number, alt: string, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null }>, category: { id: number, title: string, slug: string, description: string | null, order: number | null, seoDescription: string | null, seoTitle: string | null, showInNavigation: boolean | null, visible: boolean | null } | null, featuredImage: { id: number, alt: string, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null, socialImage: { id: number, alt: string, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null }> } | null };

export type BlogCategoriesQueryVariables = Exact<{
  page: number;
  limit: number;
  where?: Category_where | null | undefined;
}>;


export type BlogCategoriesQuery = { result: { hasNextPage: boolean, nextPage: number | null, docs: Array<{ id: number, title: string, slug: string, description: string | null, order: number | null, seoDescription: string | null, seoTitle: string | null, showInNavigation: boolean | null, visible: boolean | null }> } | null };

export type BlogPreviewMediaFieldsFragment = { id: number, alt: string | null, height: number | null, mimeType: string | null, url: string | null, width: number | null };

export type BlogPreviewAuthorFieldsFragment = { id: number, name: string | null, slug: string | null, title: string | null, githubUrl: string | null, avatar: { id: number, alt: string | null, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null };

export type BlogPreviewQueryVariables = Exact<{
  path: string;
  token: string;
}>;


export type BlogPreviewQuery = { result: { collection: string, path: string, preview: boolean, document:
      | { __typename: 'CMSChangelogPreview' }
      | { __typename: 'CMSJobPreview' }
      | { __typename: 'CMSPostPreview', id: number, title: string | null, slug: string | null, content: string | null, description: string | null, publishedAt: string | null, createdAt: string | null, updatedAt: string | null, externalAuthor: boolean | null, featured: boolean | null, seoTitle: string | null, seoDescription: string | null, authors: Array<{ id: number, name: string | null, slug: string | null, title: string | null, githubUrl: string | null, avatar: { id: number, alt: string | null, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null }> | null, category: { id: number, title: string | null, slug: string | null } | null, featuredImage: { id: number, alt: string | null, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null, socialImage: { id: number, alt: string | null, height: number | null, mimeType: string | null, url: string | null, width: number | null } | null }
      | { __typename: 'CMSWebsitePreview' }
     | null } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const BlogMediaFieldsFragmentDoc = new TypedDocumentString(`
    fragment BlogMediaFields on Media {
  id
  alt
  height
  mimeType
  url
  width
}
    `, {"fragmentName":"BlogMediaFields"}) as unknown as TypedDocumentString<BlogMediaFieldsFragment, unknown>;
export const BlogAuthorFieldsFragmentDoc = new TypedDocumentString(`
    fragment BlogAuthorFields on Author {
  id
  name
  slug
  title
  githubUrl
  avatar {
    ...BlogMediaFields
  }
}
    fragment BlogMediaFields on Media {
  id
  alt
  height
  mimeType
  url
  width
}`, {"fragmentName":"BlogAuthorFields"}) as unknown as TypedDocumentString<BlogAuthorFieldsFragment, unknown>;
export const BlogCategoryFieldsFragmentDoc = new TypedDocumentString(`
    fragment BlogCategoryFields on Category {
  id
  title
  slug
  description
  order
  seoDescription
  seoTitle
  showInNavigation
  visible
}
    `, {"fragmentName":"BlogCategoryFields"}) as unknown as TypedDocumentString<BlogCategoryFieldsFragment, unknown>;
export const BlogPreviewMediaFieldsFragmentDoc = new TypedDocumentString(`
    fragment BlogPreviewMediaFields on CMSPreviewMedia {
  id
  alt
  height
  mimeType
  url
  width
}
    `, {"fragmentName":"BlogPreviewMediaFields"}) as unknown as TypedDocumentString<BlogPreviewMediaFieldsFragment, unknown>;
export const BlogPreviewAuthorFieldsFragmentDoc = new TypedDocumentString(`
    fragment BlogPreviewAuthorFields on CMSPreviewAuthor {
  id
  name
  slug
  title
  githubUrl
  avatar {
    ...BlogPreviewMediaFields
  }
}
    fragment BlogPreviewMediaFields on CMSPreviewMedia {
  id
  alt
  height
  mimeType
  url
  width
}`, {"fragmentName":"BlogPreviewAuthorFields"}) as unknown as TypedDocumentString<BlogPreviewAuthorFieldsFragment, unknown>;
export const BlogPostsDocument = new TypedDocumentString(`
    query BlogPosts($page: Int!, $limit: Int!, $sort: String!, $where: Post_where, $includeContent: Boolean!) {
  result: Posts(
    page: $page
    limit: $limit
    sort: $sort
    where: $where
    draft: false
  ) {
    docs {
      id
      _status
      archivedAt
      title
      slug
      description
      publishedAt
      createdAt
      updatedAt
      externalAuthor
      featured
      seoTitle
      seoDescription
      content @include(if: $includeContent)
      authors {
        ...BlogAuthorFields
      }
      category {
        ...BlogCategoryFields
      }
      featuredImage {
        ...BlogMediaFields
      }
      socialImage {
        ...BlogMediaFields
      }
    }
    hasNextPage
    nextPage
  }
}
    fragment BlogMediaFields on Media {
  id
  alt
  height
  mimeType
  url
  width
}
fragment BlogAuthorFields on Author {
  id
  name
  slug
  title
  githubUrl
  avatar {
    ...BlogMediaFields
  }
}
fragment BlogCategoryFields on Category {
  id
  title
  slug
  description
  order
  seoDescription
  seoTitle
  showInNavigation
  visible
}`) as unknown as TypedDocumentString<BlogPostsQuery, BlogPostsQueryVariables>;
export const BlogCategoriesDocument = new TypedDocumentString(`
    query BlogCategories($page: Int!, $limit: Int!, $where: Category_where) {
  result: Categories(page: $page, limit: $limit, sort: "order", where: $where) {
    docs {
      ...BlogCategoryFields
    }
    hasNextPage
    nextPage
  }
}
    fragment BlogCategoryFields on Category {
  id
  title
  slug
  description
  order
  seoDescription
  seoTitle
  showInNavigation
  visible
}`) as unknown as TypedDocumentString<BlogCategoriesQuery, BlogCategoriesQueryVariables>;
export const BlogPreviewDocument = new TypedDocumentString(`
    query BlogPreview($path: String!, $token: String!) {
  result: cmsContentPreview(collection: posts, path: $path, token: $token) {
    collection
    path
    preview
    document {
      __typename
      ... on CMSPostPreview {
        id
        title
        slug
        content
        description
        publishedAt
        createdAt
        updatedAt
        externalAuthor
        featured
        seoTitle
        seoDescription
        authors {
          ...BlogPreviewAuthorFields
        }
        category {
          id
          title
          slug
        }
        featuredImage {
          ...BlogPreviewMediaFields
        }
        socialImage {
          ...BlogPreviewMediaFields
        }
      }
    }
  }
}
    fragment BlogPreviewMediaFields on CMSPreviewMedia {
  id
  alt
  height
  mimeType
  url
  width
}
fragment BlogPreviewAuthorFields on CMSPreviewAuthor {
  id
  name
  slug
  title
  githubUrl
  avatar {
    ...BlogPreviewMediaFields
  }
}`) as unknown as TypedDocumentString<BlogPreviewQuery, BlogPreviewQueryVariables>;