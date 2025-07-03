import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
  return (
    <Html>
      <Head>
        <meta
          name="supabase-url"
          content={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
        />
        <meta
          name="supabase-key"
          content={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 