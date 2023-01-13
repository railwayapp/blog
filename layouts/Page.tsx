import React from "react"
import Footer from "@components/Footer"
import Nav from "@components/Nav"
import SEO, { Props as SEOProps } from "@components/Seo"

export interface Props {
  seo?: SEOProps
  children?: React.ReactNode
}

const Page: React.FC<Props> = (props) => {
  return (
    <>
      <SEO {...props.seo} />

      <Nav />

      <div className="min-h-screen overflow-x-hidden relative">
        {props.children}
      </div>

      <Footer />
    </>
  )
}

export default Page
