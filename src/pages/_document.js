import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
          rel='stylesheet'
        />
      </Head>

      <body className='antialiased'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
