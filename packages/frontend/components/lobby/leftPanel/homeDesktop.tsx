import { ReactElement } from 'react';

import Taako from './taako';
import Announcements from './announcements';
import OnlinePlayers from './onlinePlayers';
import dateGenObj from '../../../utils/dateGenerator';

const HomeDesktop = (): ReactElement => (
  <>
    <div className="wrapper">
      <div className="taako_wrapper">
        <Taako />
      </div>
      <div>
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
              text: 'Players will now be required to wear bows',
            },
          ]}
        />
      </div>
      <div className="online_players">
        <OnlinePlayers />
      </div>
    </div>
    <style jsx>
      {`
        .wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .online_players {
          flex-grow: 1;
          height: 100%;
        }
      `}
    </style>
  </>
);

export default HomeDesktop;
