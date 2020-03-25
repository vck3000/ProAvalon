import { ReactElement } from 'react';
import GameCard, { IGameCardData } from './gameCard';

const gameCardsData: IGameCardData[] = [
  {
    id: 193,
    status: 'in progress',
    missionHistory: ['success', 'success', 'fail'],
    host: 'Maria',
    mode: 'Avalon',
    spectators: 5,
    avatarLinks: [
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
    ],
  },
  {
    id: 194,
    status: 'finished',
    missionHistory: ['success', 'success', 'fail', 'fail', 'fail'],
    host: 'ProNub',
    mode: 'Avalon',
    spectators: 75830,
    avatarLinks: [
      'https://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
    ],
  },
  {
    id: 195,
    status: 'finished',
    missionHistory: ['success', 'success', 'fail', 'fail', 'fail'],
    host: 'ProNub',
    mode: 'Avalon',
    spectators: 75830,
    avatarLinks: [
      'https://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
    ],
  },
  {
    id: 196,
    status: 'finished',
    missionHistory: ['success', 'success', 'fail', 'fail', 'fail'],
    host: 'ProNub',
    mode: 'Avalon',
    spectators: 75830,
    avatarLinks: [
      'https://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
      '/game_room/base-res.png',
    ],
  },
];

// export interface IGameCardData {
//   id: number;
//   missionHistory: MissionHistoryType[]; // max 5
//   host: string;
//   mode: string;
//   spectators: number;
//   avatarLinks: string[]; // max 10
// }

const GameMenu = (): ReactElement => {
  return (
    <>
      <div className="wrapper">
        {gameCardsData.map((gameCardData) => (
          <GameCard key={gameCardData.id} data={gameCardData} />
        ))}
      </div>
      <style jsx>
        {`
          .wrapper {
            height: 100%;
            overflow-y: scroll;
          }
        `}
      </style>
    </>
  );
};

export default GameMenu;
