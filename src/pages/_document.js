import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='id'>
      <Head>
        {/* Favicon untuk Tab Browser */}
        <link rel='icon' type='image/jpeg' href='/logo-myramadhan.jpeg' />
        <link rel='apple-touch-icon' href='/logo-myramadhan.jpeg' />

        {/* Kode PWA */}
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#1e3a8a' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='MyRamadhan' />

        {/* Font Arab (Amiri) */}
        <link
          href='https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
