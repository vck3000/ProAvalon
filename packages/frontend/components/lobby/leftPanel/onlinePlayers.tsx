import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

const OnlinePlayers = (): ReactElement => {
  const players = useSelector((state: RootState) => state.lobby.onlinePlayers);
  const numPlayers = players.length;

  return (
    <>
      <div>
        <strong>ONLINE PLAYERS ({numPlayers})</strong>
      </div>
      <ul>
        {players.map((player, i) => (
          <li
            key={player.displayUsername}
            style={{
              background: i % 2 === 0 ? 'var(--light-alt)' : 'var(--light)',
            }}
          >
            {player.displayUsername}
          </li>
        ))}
      </ul>

      <style jsx>
        {`
          div {
            padding: 12px;
            background: var(--light);
            color: var(--gold);
            text-align: center;
          }

          ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          li {
            padding: 12px;
            font-weight: bold;
          }
        `}
      </style>
    </>
  );
};

export default OnlinePlayers;
