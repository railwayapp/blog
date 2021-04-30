import '@styles/globals.css'

import type { AppProps } from 'next/app'

import useFathom from '@hooks/useFathom'

const RailwayBlog = ({ Component, pageProps }: AppProps) => {
  useFathom(process.env.NEXT_PUBLIC_FATHOM_CODE ?? '', 'blog.railway.app')
  return <Component {...pageProps} />
}

export default RailwayBlog
