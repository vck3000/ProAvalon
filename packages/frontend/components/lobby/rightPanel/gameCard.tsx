import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import Link from 'next/link';

import { RootState } from '../../../store';
import { ThemeOptions } from '../../../store/userOptions/types';
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

interface IStateProps {
  theme: ThemeOptions;
}

interface IOwnProps {
  data: IGameCardData;
}

type Props = IOwnProps & IStateProps;

const GameCard = (props: Props): ReactElement => {
  const { theme, data } = props;
  // Remove the following when you start using theme
  // eslint-disable-next-line no-unused-expressions
  theme;

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
            background-color: ${theme.colors.LIGHT};
            padding-top: 15px;
            padding-left 15px;
          }

          .room {
            color: ${theme.colors.GOLD_LIGHT};
          }

          .host {
            color: ${theme.colors.TEXT_GRAY_LIGHT};
            padding-top: 3px;
          }

          .mode {
            color: ${theme.colors.TEXT_GRAY_LIGHT};
            padding-top: 1px;
          }

          .spectators {
            color: ${theme.colors.TEXT_GRAY_LIGHT};
            padding-top: 1px;
            padding-bottom: 3px;
          }

          .bottom_half {
            background-color: ${theme.colors.ALT_LIGHT};
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

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
});

export default connect(
  mapStateToProps,
  null,
)(GameCard as (props: IOwnProps) => ReactElement);
