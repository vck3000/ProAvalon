import { ReactElement } from 'react';

import LobbyIndex from '../components/lobby/lobby/lobbyIndex';

const Lobby = (): ReactElement => (
  <>
    <title>Lobby</title>
    <LobbyIndex />
    <style global jsx>
      {`
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
        }

        .ui.grid {
          margin: 0;
        }
      `}
    </style>
  </>
);

export default Lobby;
