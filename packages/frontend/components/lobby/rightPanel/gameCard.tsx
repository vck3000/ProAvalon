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
          <p className="room">ROOM #{data.id}</p>
          <MissionHistory missionHistory={data.missionHistory} />
          <p className="host">
            HOST: <span className="normal_font">{data.host}</span>
          </p>
          <p className="mode">
            MODE: <span className="normal_font">{data.mode}</span>
          </p>
          <p className="spectators">
            SPECTATORS: <span className="normal_font">{data.spectators}</span>
          </p>
        </div>
        <div className="bottom_half">
          <div className="avatar_row">
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
          </div>
          <div className="avatar_row">
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
            <img
              src="/game_room/base-res.png"
              alt="avatar"
              className="avatar"
            />
          </div>
        </div>
        <style jsx>
          {`
          p {
            margin: 0;
          }

          .game_card {
            cursor: pointer;
          }

          .game_card:hover {
            opacity: 0.75;
          }

          .normal_font {
            font-family: Montserrat-Regular;
          }

          .top_half {
            font-family: Montserrat-Bold;
            background-color: var(--light);
            padding-top: 15px;
            padding-left 15px;
          }

          .room {
            color: var(--gold-light);
          }

          .host {
            color: var(--text-gray-light);
            padding-top: 3px;
          }

          .mode {
            color: var(--text-gray-light);
            padding-top: 1px;
          }

          .spectators {
            color: var(--text-gray-light);
            padding-top: 1px;
            padding-bottom: 3px;
          }

          .bottom_half {
            background-color: var(--light-alt);
            display: flex;
            flex-wrap: nowrap;
            flex-direction: column;
            padding: 10px;
          }

          .avatar_row {
            display: flex;
            justify-content: space-evenly;
          }

          .avatar {
            max-width: 50px;
            max-height: 50px;
            width: 20%;
          }
        `}
        </style>
      </div>
    </Link>
  );
};

export default GameCard;
