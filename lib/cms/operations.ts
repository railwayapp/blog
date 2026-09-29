import {
  BlogPostsDocument,
  BlogCategoriesDocument,
  BlogPreviewDocument,
} from "./generated/graphql"

export const blogPostsQuery = {
  name: "BlogPosts",
  document: BlogPostsDocument,
}
export const blogCategoriesQuery = {
  name: "BlogCategories",
  document: BlogCategoriesDocument,
}
export const blogPreviewQuery = {
  name: "BlogPreview",
  document: BlogPreviewDocument,
}
