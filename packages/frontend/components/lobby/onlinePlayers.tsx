import React, { ReactElement } from 'react';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

type Reward = 'badge' | 'winner';

interface IPlayer {
  username: string;
  extras?: [Reward];
}

interface IOwnProps {
  players: IPlayer[];
}
interface IStateProps {
  theme: ThemeOptions;
}

type Props = IOwnProps & IStateProps;

const OnlinePlayers = (props: Props): ReactElement => {
  const { players, theme } = props;
  const numPlayers = players.length;

  return (
    <>
      <div className="wrapper">
        <div className="online_players_inner_wrapper">
          <Table
            celled
            compact
            unstackable
            style={{ background: 'transparent' }}
          >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="online_players">
                  ONLINE PLAYERS ({numPlayers})
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {players.map((player) => (
                <Table.Row key={player.username} className="row">
                  <Table.Cell>{player.username}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>

      <style jsx>
        {`
          .list {
            border: 1px solid red;
          }

          .wrapper {
            height: 100%;
            position: relative;
          }

          .online_players_inner_wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .online_players_inner_wrapper :global(.online_players) {
            color: ${theme.colors.GOLD};
            font-family: Montserrat-Bold;
            text-align: center;
            background: ${theme.colors.LIGHT};
            border: none;
          }

          .online_players_inner_wrapper :global(.row td) {
            font-family: Montserrat-Bold;
            color: ${theme.colors.TEXT};
            padding: 0.5em 1.2em;
            border: none;
          }

          .online_players_inner_wrapper :global(.row:nth-child(odd)) {
            background: ${theme.colors.ALT_LIGHT};
          }

          .online_players_inner_wrapper :global(.row:nth-child(even)) {
            background: ${theme.colors.LIGHT};
          }

          .online_players_inner_wrapper :global(table) {
            border: none;
          }

          .online_players_inner_wrapper :global(tbody) {
            display: block;
            overflow: auto;
            height: 300px;
          }

          .online_players_inner_wrapper :global(th, tr) {
            display: block;
            width: 100%;
          }

          .online_players_inner_wrapper :global(tbody)::-webkit-scrollbar {
            width: 0.5em;
          }

          .online_players_inner_wrapper
            :global(tbody)::-webkit-scrollbar-track {
            background-color: ${theme.colors.LIGHT};
          }

          .online_players_inner_wrapper :global(tbody)::-webkit-scrollbar {
            background-color: ${theme.colors.ALT_LIGHT};
          }
        `}
      </style>
    </>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
});

export default connect(
  mapStateToProps,
  null,
)(OnlinePlayers as (props: IOwnProps) => ReactElement);
