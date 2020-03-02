/* eslint-disable react/jsx-props-no-spreading */
import { AppProps } from 'next/app';
import { Store } from 'redux';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import withReduxSaga from 'next-redux-saga';
import createStore from '../store';

interface IProps extends AppProps {
  store: Store;
}

const MyApp = ({ Component, pageProps, store }: IProps): ReactElement => (
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
        }
      `}
    </style>
  </>
);

export default withRedux(createStore)(withReduxSaga(MyApp));
