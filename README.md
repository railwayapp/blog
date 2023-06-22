# Railway Blog

This repository contains the source code for the [Railway blog](https://blog.railway.app/). We use a [NextJS](https://nextjs.org/) app with [Notion](https://www.notion.so/) as our CMS.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Frailwayapp%2Fblog&envs=NOTION_API_TOKEN%2CPOSTS_TABLE_ID&NOTION_API_TOKENDesc=The+token+for+your+Notion+integration&POSTS_TABLE_IDDesc=The+database+ID+for+the+table+containing+your+posts)

## ✨ Features

- NextJS
- TypeScript
- TailwindCSS
- Notion

## 💁‍♀️ How to use

We also have a [detailed guide](https://blog.railway.app/p/notion-public-api) on our blog to help users deploy a similar blog using Railway.

### Step 1: Create a notion DB
You can find instructions on how to [set up the Notion Database](https://blog.railway.app/p/next-notion-blog#setting-up-our-cms-on-notion), TLDR you need the following fields in a *Database - Inline* on a page, it needs to be inline, or else it won't work.

- Page (Title) - The page containing a post
- Slug (Text) - The URL of a post
- Published (Checkbox) - Only published blog posts show up on the website
- Date (Date) - The date the post was published
- Authors (Person) - A list of users that wrote the post
- Image (Text) - The URL of the meta image for a post
- Description (Text) - The preview text for the post
- Featured (Checkbox) - Show post in the featured section
- FeaturedImage (Text) - The URL of the image to use when a post is featured
- Category (Select) - Post category options

### Step 2: Create a Notion Integration

This will be done on Notion's [Manage Integration page](https://www.notion.so/my-integrations), copy the token, this will be used as `NOTION_API_TOKEN`

### Step 3: Get a hold of your Database ID

You can get this from the URL of the page, which you can obtain by clicking the *Share* button in the upper-right of the page and clicking *Copy Link*. The link structure is `https://www.notion.so/<user>/<database_Id>?v=....` , the database_Id will be used as `POSTS_TABLE_ID` during the deploy.

That is it, just make sure the properties on a post within Notion are not empty.

## 📝 Notes

This blog is heavily based on [this example](https://github.com/ijjk/notion-blog) by JJ Kasper.
