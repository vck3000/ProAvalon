import { ReactElement } from 'react';
import { Grid } from 'semantic-ui-react';

import Layout from '../layout/Layout';
import GamesMenu from './rightPanel/gamesMenu';
import HomeIndex from './leftPanel/homeIndex';
import Chat from './mainPanel/chat';

const LobbyDesktop = (): ReactElement => (
  <Layout>
    <div className="lobbyContent">
      <Grid style={{ margin: 0 }}>
        <Grid.Column width={4}>
          <HomeIndex />
        </Grid.Column>

        <Grid.Column width={8}>
          <Chat />
        </Grid.Column>
        <Grid.Column width={4} style={{ height: '100%', overflowY: 'auto' }}>
          <GamesMenu />
        </Grid.Column>
      </Grid>
    </div>
    <style jsx>
      {`
        .lobbyContent {
          flex: 1;
          overflow: hidden;
          padding: 0 1rem 1rem 1rem;
        }

        .lobbyContent > :global(.grid) {
          height: 100%;
        }

        .lobbyContent > :global(.grid) > :global(.column) {
          padding: 0 1rem;
        }
      `}
    </style>
  </Layout>
);

export default LobbyDesktop;
