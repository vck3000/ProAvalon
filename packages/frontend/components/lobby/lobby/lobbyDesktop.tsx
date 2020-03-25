import { ReactElement } from 'react';
import { Grid } from 'semantic-ui-react';
import Link from 'next/link';

import NavIndex from '../../nav/navIndex';
import GamesMenu from '../gamesMenu/gamesMenu';
import LobbyLeftPanel from './lobbyLeftPanel';
import Chat from '../chat';

const LobbyDesktop = (): ReactElement => (
  <div className="container">
    <Grid divided="vertically" padded style={{ height: '100%' }}>
      <Grid.Column width={4}>
        <div className="left_wrapper">
          <div className="logo_wrapper">
            <Link href="/">
              <a>
                <img src="/common/logo.png" alt="logo" className="logo" />
              </a>
            </Link>
          </div>
          <div className="lobbyleftPanel">
            <LobbyLeftPanel />
          </div>
        </div>
      </Grid.Column>

      <Grid.Column width={12} className="center">
        <Grid.Row className="navbar">
          <NavIndex />
        </Grid.Row>
        <Grid.Row style={{ height: '100%' }}>
          <Grid style={{ height: '100%' }}>
            <Grid.Column width={11}>
              <Chat />
            </Grid.Column>
            <Grid.Column width={5}>
              <GamesMenu />
            </Grid.Column>
          </Grid>
        </Grid.Row>
      </Grid.Column>
    </Grid>

    <style jsx>
      {`
        .container {
          padding: 5px 5px 30px 5px;
          z-index: -1;
          height: 100%;
        }

        .ui.grid {
          margin-top: 0;
        }

        .logo {
          max-width: 200px;
          width: 100%;
        }

        .left_wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
        }

        .lobbyleftPanel {
          flex-grow: 1;
        }
      `}
    </style>
  </div>
);

export default LobbyDesktop;
