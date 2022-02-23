import React from "react"
import Footer from "@components/Footer"
import Nav from "@components/Nav"
import SEO, { Props as SEOProps } from "@components/Seo"

export interface Props {
  seo?: SEOProps
}

const Page: React.FC<Props> = (props) => {
  return (
    <>
      <SEO {...props.seo} />

      <Nav />

      <div className="min-h-screen">{props.children}</div>

      <Footer />
    </>
  )
}

export default Page
