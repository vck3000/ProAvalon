/* eslint-disable react/jsx-props-no-spreading */
import { AppProps } from 'next/app';
import { Store } from 'redux';
import { ReactElement, useEffect } from 'react';
import { Provider, connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';

import throttle from '../utils/throttle';
import configureStore, { RootState } from '../store';
import { IUserOptionsState, ThemeOptions } from '../store/userOptions/types';
import { MobileView, ISystemState } from '../store/system/types';
import { setMobileView, setWindowDimensions } from '../store/system/actions';

interface IProps extends AppProps {
  store: Store;
  dispatchSetMobileView: typeof setMobileView;
  dispatchSetWindowDimensions: typeof setWindowDimensions;
  mobileView: MobileView;
  theme: ThemeOptions;
}

const MyApp = ({
  Component,
  pageProps,
  store,
  dispatchSetMobileView,
  dispatchSetWindowDimensions,
  mobileView,
  theme,
}: IProps): ReactElement => {
  // Set up window event listener to set mobileView, width and height.
  useEffect(() => {
    const MOBILE_VIEW_CUTOFF = 600;
    const resizeWindow = throttle((): void => {
      if (
        (window.innerWidth <= MOBILE_VIEW_CUTOFF && !mobileView) ||
        (window.innerWidth > MOBILE_VIEW_CUTOFF && mobileView)
      ) {
        dispatchSetMobileView(!mobileView);
      }
      // Always send out a width and height update.
      dispatchSetWindowDimensions(window.innerWidth, window.innerHeight);
    }, 100);

    resizeWindow();

    // Add event listener and remove when resize.
    window.addEventListener('resize', resizeWindow);
    return (): void => window.removeEventListener('resize', resizeWindow);
  }, [mobileView]);

  useEffect(() => {
    if (theme.name === 'night') document.body.classList.add('night');
    else document.body.classList.remove('night');
  }, [theme]);

  return (
    <>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
      <style global jsx>
        {`
          @font-face {
            font-family: 'Montserrat-Regular';
            src: url('/fonts/Montserrat/Montserrat-Regular.ttf');
          }
          @font-face {
            font-family: 'Montserrat-Bold';
            src: url('/fonts/Montserrat/Montserrat-Bold.ttf');
          }
          @font-face {
            font-family: 'Montserrat-ExtraBold';
            src: url('/fonts/Montserrat/Montserrat-ExtraBold.ttf');
          }
          @font-face {
            font-family: 'Montserrat-Thin';
            src: url('/fonts/Montserrat/Montserrat-Thin.ttf');
          }
          @font-face {
            font-family: 'Montserrat-Light';
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
            --light-alt: #e4e3da;
            --gold: #a37d18;
            --gold-light: #bfa751;
            --gold-hover: #8a6d20;
            --mission-blue: #3663a4;
            --mission-red: #87504d;
            --announce-gold-text: #bab07a;
            --slide-gold-background: #483e20;
          }

          .night {
            --background: #1b1b1b;
            --text: #eeeeee;
            --text-gray: #4e4e44;
            --text-gray-light: #7c8089;
            --text-red: #894e3e;
            --text-pink: #f27474;
            --light: #212121;
            --light-alt: #2f2e2a;
            --gold: #a37d18;
            --gold-light: #bda84f;
            --gold-hover: #8a6d20;
            --mission-blue: #3663a4;
            --mission-red: #87504d;
            --announce-gold-text: #bab07a;
            --slide-gold-background: #483e20;
          }

          body {
            font-family: 'Montserrat-Regular', sans-serif;
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

const mapStateToProps = (
  state: RootState,
): Pick<ISystemState & IUserOptionsState, 'mobileView' | 'theme'> => ({
  mobileView: state.system.mobileView,
  theme: state.userOptions.theme,
});

const mapDispatchToProps = {
  dispatchSetMobileView: setMobileView,
  dispatchSetWindowDimensions: setWindowDimensions,
};

export default withRedux(configureStore)(
  withReduxSaga(connect(mapStateToProps, mapDispatchToProps)(MyApp)),
);
