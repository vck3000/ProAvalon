/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Provider, connect } from "react-redux";
import { Dispatch } from 'redux';
import Head from 'next/head';

import { COLOR_DAY, COLOR_NIGHT } from '../components/colours';
import Homepage from '../components/homepage';
import Lobby from '../components/lobby';
import Nav from '../components/nav';

import store from '../store';
import { ReducersState } from '../store/types';
import { HomeState, HomeActions } from '../store/types/home';
import { changeTheme } from '../store/actions/home';

export interface Props {
  nightTheme?: boolean;
  handleThemeChange?: () => void;
}

const Home = (props: Props): React.ReactElement => {
  const { handleThemeChange, nightTheme } = props;

  return (
    <div className="background">
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
      </Head>

      <Nav />

      <span role="button" tabIndex={0} onClick={handleThemeChange} className="switch-container">
        <input type="checkbox" id="toggle" className="checkbox" checked={nightTheme} onChange={handleThemeChange} />
        <label htmlFor="toggle" className="switch" />
      </span>

      <Homepage nightTheme={nightTheme} />

      <Lobby nightTheme={nightTheme} />

      <style jsx>
        {`
          .background {
            background-color: ${nightTheme ? COLOR_NIGHT : COLOR_DAY};
            z-index: -1;
          }

          .background .background_img_overlay {
            pointer-events: none;
            position: absolute;
            width: 100%;
            height: 100%;
          }

          span:focus {
            outline: none;
          }

          .switch-container {
            position: absolute;
            display: inline-block;
            width: 40px;
            height: 20px;
            background-color: #eee;
            border-radius: 20px;
          }

          .switch::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: white;
            top: 1px; // TO GIVE AN EFFECT OF CIRCLE INSIDE SWITCH.
            left: 1px;
            transition: all 0.3s;
          }

          .checkbox:checked + .switch::after {
            left : 20px; 
          }
          .checkbox:checked + .switch {
            background-color: #777;
          }
          .checkbox { 
            display : none;
         }
      `}
      </style>

      <style global jsx>
        {`
          html,
          body,
          body > div:first-child,
          div#__next,
          div#__next > div,
          div#__next > div > div {
            height: 100%;
          }
          body {
            margin: 0px;
          }
        `}
      </style>
    </div>
)};

const mapStateToProps = (state: ReducersState): HomeState => ({
  nightTheme: state.homeReducer.nightTheme
});

const mapDispatchToProps = (dispatch: Dispatch): Props => ({
  handleThemeChange: (): HomeActions => dispatch(changeTheme())
});

const HomeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

export default (): React.ReactElement => (
  <Provider store={store}>
    <HomeContainer />
  </Provider>
);
