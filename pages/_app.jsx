import { useEffect } from 'react';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <>
      <Head>
        <title>华文词汇练习</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Singapore O-Level 华文 vocabulary trainer — syllabus words, past exam words, 成语, quizzes and a 错题本." />
        <meta name="theme-color" content="#D85A30" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="华文词汇" />
      </Head>
      <style global jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #FAFAF8;
          color: #1A1A18;
          -webkit-text-size-adjust: 100%;
        }
        input, button { font-family: inherit; }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
