import React, { ReactElement } from 'react';
import Link from 'next/link';
import { LobbyGame } from '@proavalon/proto/game';

import MissionHistory from './missionHistory';

// TODO: add Status to LobbyGame in proto
// type Status = 'waiting' | 'in progress' | 'finished';

interface IOwnProps {
  game: LobbyGame;
}

const GameCard = ({ game }: IOwnProps): ReactElement => {
  return (
    <Link href="/game/[id]" as={`/game/${game.id}`}>
      <div className="game_card">
        <div className="top_half">
          <strong className="room">ROOM #{game.id}</strong>
          <MissionHistory missionHistory={game.missionHistory} />
          <p>
            <strong>HOST: </strong>
            {game.host}
          </p>
          <p>
            <strong>MODE: </strong>
            {game.mode}
          </p>
          <p>
            <strong>SPECTATORS: </strong>
            {game.spectators}
          </p>
        </div>
        <div className="avatars">
          {/* for keys, probably want player names added to game data */}
          {game.avatarLinks.map((link) => (
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
