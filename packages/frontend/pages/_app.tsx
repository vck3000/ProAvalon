/* eslint-disable react/jsx-props-no-spreading */
import { AppProps } from 'next/app';
import { Store } from 'redux';
import { ReactElement, useEffect } from 'react';
import { Provider, connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';

import createStore, { RootState } from '../store';
import { IUserOptionsState, ThemeOptions } from '../store/userOptions/types';
import { MobileView, ISystemState } from '../store/system/types';
import setMobileView from '../store/system/actions';

interface IProps extends AppProps {
  store: Store;
  dispatchSetMobileView: typeof setMobileView;
  mobileView: MobileView;
  theme: ThemeOptions;
}

const MyApp = ({
  Component,
  pageProps,
  store,
  dispatchSetMobileView,
  mobileView,
  theme,
}: IProps): ReactElement => {
  useEffect(() => {
    const MOBILE_VIEW_CUTOFF = 600;
    const resizeWindow = (): void => {
      if (
        (window.innerWidth <= MOBILE_VIEW_CUTOFF && !mobileView) ||
        (window.innerWidth > MOBILE_VIEW_CUTOFF && mobileView)
      ) {
        dispatchSetMobileView(!mobileView);
      }
    };
    resizeWindow();

    window.addEventListener('resize', resizeWindow);
    return (): void => window.removeEventListener('resize', resizeWindow);
  }, [mobileView]);

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

          body {
            font-family: 'Montserrat-Regular', sans-serif;
            min-width: 200px;
            background-color: ${theme.colors.BACKGROUND};
            color: ${theme.colors.TEXT};
          }
        `}
      </style>
    </>
  );
};

const mapStateToProps = (
  state: RootState,
): Pick<ISystemState & IUserOptionsState, 'mobileView' | 'theme'> => ({
  mobileView: state.system.mobileView,
  theme: state.userOptions.theme,
});

const mapDispatchToProps = {
  dispatchSetMobileView: setMobileView,
};

export default withRedux(createStore)(
  withReduxSaga(connect(mapStateToProps, mapDispatchToProps)(MyApp)),
);
