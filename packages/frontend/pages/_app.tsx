/* eslint-disable react/jsx-props-no-spreading */
import { AppProps } from 'next/app';
import { Store } from 'redux';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';

import configureStore from '../store';
import Resize from '../components/resize';
import Theme from '../components/theme';

interface IProps extends AppProps {
  store: Store;
}

const MyApp = ({ Component, pageProps, store }: IProps): ReactElement => {
  return (
    <>
      <Provider store={store}>
        <Resize />
        <Theme />
        <Component {...pageProps} />
      </Provider>
      <style global jsx>
        {`
          @font-face {
            font-family: 'Montserrat';
            font-weight: 400;
            src: url('/fonts/Montserrat/Montserrat-Regular.ttf');
          }
          @font-face {
            font-family: 'Montserrat';
            font-weight: 700;
            src: url('/fonts/Montserrat/Montserrat-Bold.ttf');
          }
          @font-face {
            font-family: 'Montserrat';
            font-weight: 800;
            src: url('/fonts/Montserrat/Montserrat-ExtraBold.ttf');
          }
          @font-face {
            font-family: 'Montserrat';
            font-weight: 100;
            src: url('/fonts/Montserrat/Montserrat-Thin.ttf');
          }
          @font-face {
            font-family: 'Montserrat';
            font-weight: 300;
            src: url('/fonts/Montserrat/Montserrat-Light.ttf');
          }

          :root {
            --background: #eaeae4;
            --text: black;
            --text-gray: #bab9b6;
            --text-gray-light: #7c818a;
            --text-red: #8f5543;
            --text-pink: #f27474;
            --light: #deded8;
            --light-inactive: #d1d2cd;
            --light-alt: #e4e3da;
            --gold: #a37d18;
            --gold-light: #bfa751;
            --gold-hover: #8a6d20;
            --mission-blue: #6f9298;
            --mission-red: #9e522e;
            --mission-approve: #a8b46a;
            --mission-reject: #b99885;
            --mission-leader: #000000;
            --announce-gold-text: #bab07a;
            --slide-gold-background: #483e20;
          }

          .night {
            --background: #232323;
            --text: #eeeeee;
            --text-gray: #4e4e44;
            --text-gray-light: #7c8089;
            --text-red: #894e3e;
            --text-pink: #f27474;
            --light: #161614;
            --light-inactive: #2e2e2e;
            --light-alt: #312e27;
            --gold: #a37d18;
            --gold-light: #bda84f;
            --gold-hover: #8a6d20;
            --mission-blue: #6f9298;
            --mission-red: #9e522e;
            --mission-approve: #6f774e;
            --mission-reject: #6a493a;
            --mission-leader: #c6c0b4;
            --announce-gold-text: #bab07a;
            --slide-gold-background: #483e20;
          }

          // CSS to make NextJS Page one page tall
          html,
          body,
          body > div:first-child,
          div#__next {
            height: 100%;
          }

          body {
            margin: 0px;
            overflow: hidden;
            font-family: 'Montserrat', sans-serif;
            min-width: 200px;
            background-color: var(--background);
            color: var(--text);
          }
        `}
      </style>
    </>
  );
};

// Disable all getInitialProps. Check next.config.js for information.
// MyApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps> => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);

//   return { ...appProps }
// }

export default withRedux(configureStore)(withReduxSaga(MyApp));
