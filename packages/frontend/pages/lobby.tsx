import { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../store/index';
import { MobileView } from '../store/system/types';

import LobbyMobile from '../components/lobby/lobbyMobile';
import LobbyDesktop from '../components/lobby/lobbyDesktop';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const Lobby = ({ mobileView }: Props): ReactElement => (
  <>
    <title>Lobby</title>
    {mobileView ? <LobbyMobile /> : <LobbyDesktop />}
    <style global jsx>
      {`
        // CSS to make NextJS Page one page tall
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }

        body {
          margin: 0px;
        }

        .main_grid {
          height: 100%;
        }

        .container .center {
          display: flex !important;
          flex-direction: column;
        }

        .container .logo_wrapper {
          text-align: center;
        }

        .container .chat_games {
          height: 100%;
        }

        .ui.grid {
          margin: 0;
        }
      `}
    </style>
  </>
);

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(Lobby);
