import Document, {
  Html,
  Head,
  Main,
  NextScript,
  // DocumentContext,
} from 'next/document';
import { ReactElement } from 'react';

class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.png" />
          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
          />
        </Head>
        <body className="night">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
