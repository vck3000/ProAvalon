import React, { ReactElement } from 'react';

import Link from 'next/link';

import MissionHistory, { MissionHistoryType } from './missionHistory';

type Status = 'waiting' | 'in progress' | 'finished';

export interface IGameCardData {
  id: number;
  status: Status;
  missionHistory: MissionHistoryType[]; // max 5
  host: string;
  mode: string;
  spectators: number;
  avatarLinks: string[]; // max 10
}

interface IOwnProps {
  data: IGameCardData;
}

const GameCard = (props: IOwnProps): ReactElement => {
  const { data } = props;

  return (
    <Link href="/game/[id]" as={`/game/${data.id}`}>
      <div className="game_card">
        <div className="top_half">
          <strong className="room">ROOM #{data.id}</strong>
          <MissionHistory missionHistory={data.missionHistory} />
          <p>
            <strong>HOST: </strong>
            {data.host}
          </p>
          <p>
            <strong>MODE: </strong>
            {data.mode}
          </p>
          <p>
            <strong>SPECTATORS: </strong>
            {data.spectators}
          </p>
        </div>
        <div className="avatars">
          {/* for keys, probably want player names added to game data */}
          {data.avatarLinks.map((link) => (
            <img src={link} alt="avatar" className="avatar" />
          ))}
        </div>
        <style jsx>
          {`
            p {
              margin: 0;
              color: var(--text-gray-light);
            }

            .game_card {
              cursor: pointer;
            }

            .game_card:hover {
              opacity: 0.75;
            }

            .top_half {
              background-color: var(--light);
              padding: 16px 16px 8px 16px;
            }

            .room {
              color: var(--gold-light);
            }

            .avatars {
              background-color: var(--light-alt);
              display: flex;
              flex-wrap: wrap;
              justify-content: space-around;
              padding: 10px;
            }

            .avatar {
              max-height: 50px;
            }
          `}
        </style>
      </div>
    </Link>
  );
};

export default GameCard;
