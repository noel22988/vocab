export default function App({ Component, pageProps }) {
  return (
    <>
      <style global jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAFAF8; color: #1A1A18; }
        input, button { font-family: inherit; }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
