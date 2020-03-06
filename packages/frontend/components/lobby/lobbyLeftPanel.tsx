import { ReactElement } from 'react';
import { Grid } from 'semantic-ui-react';

import Taako from './taako';
import Announcements from './announcements';
import { dateGenObj } from './chat';
import OnlinePlayers from './onlinePlayers';

const LobbyLeftPanel = (): ReactElement => (
  <>
    <Grid.Row className="taako_wrapper">
      <Taako />
    </Grid.Row>
    <Grid.Row>
      <Announcements
        announcements={[
          {
            id: '1',
            timestamp: new Date(dateGenObj.next().value as number),
            link: '/announcements/123',
            text: 'New Patreon rewards!',
          },
          {
            id: '2',
            timestamp: new Date(dateGenObj.next().value as number),
            link: '/announcements/123',
            text: 'Morgana cannot lie anymore!',
          },
          {
            id: '3',
            timestamp: new Date(dateGenObj.next().value as number),
            link: '/announcements/123',
            text: 'Players will now be allowed to wear bows',
          },
        ]}
      />
    </Grid.Row>
    <Grid.Row>
      <OnlinePlayers
        players={[
          { username: 'ProNub' },
          { username: 'Skies' },
          { username: 'Pam' },
          { username: 'Pam2' },
          { username: 'Pam3' },
          { username: 'Pam4' },
          { username: 'Pam5' },
          { username: 'Pam6' },
          { username: 'Pam7' },
          { username: 'Pam8' },
          { username: 'Pam9' },
        ]}
        maxHeight="350px"
      />
    </Grid.Row>
  </>
);

export default LobbyLeftPanel;
