import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta property="og:title" content="nextext" key="title"/>
        <meta property="og:description" content="what should u text next?" key="description"/>
        <meta
          property="og:image"
          content="https://miro.medium.com/max/1400/1*BVkgPgXLhrMl2o4DLT6-og.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
