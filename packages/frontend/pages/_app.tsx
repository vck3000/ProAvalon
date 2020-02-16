import { AppProps } from 'next/app';
import { ReactElement } from 'react';

import { config } from '@fortawesome/fontawesome-svg-core';
// Import the CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
// Tell Font Awesome to skip adding the CSS automatically since it's being imported above
config.autoAddCss = false;

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Component {...pageProps} />
);

export default MyApp;
