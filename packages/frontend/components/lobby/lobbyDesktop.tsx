import { ReactElement } from 'react';

import Layout from '../layout/layout';
import GamesMenu from './rightPanel/gamesMenu';
import HomeIndex from './leftPanel/homeIndex';
import Chat from '../chat/chatContainer';

const LobbyDesktop = (): ReactElement => (
  <Layout>
    <div className="lobbyContent">
      <div style={{ width: '25%' }}>
        <HomeIndex />
      </div>
      <div style={{ width: '50%' }}>
        <Chat type="lobby" />
      </div>
      <div style={{ height: '100%', width: '25%', overflowY: 'auto' }}>
        <GamesMenu />
      </div>
    </div>
    <style jsx>
      {`
        .lobbyContent {
          display: flex;
          flex: 1;
          overflow: hidden;
          padding: 0 1rem 1rem 1rem;
          height: 100%;
        }

        .lobbyContent > div {
          padding: 0 1rem;
        }
      `}
    </style>
  </Layout>
);

export default LobbyDesktop;
