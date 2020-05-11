import React, { ReactElement } from 'react';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { IOnlinePlayer } from '../../../store/lobby/onlinePlayers/types';
import { MobileView } from '../../../store/system/types';

interface IStateProps {
  players: IOnlinePlayer[];
  mobileView: MobileView;
}

type Props = IStateProps;

const OnlinePlayers = ({ players, mobileView }: Props): ReactElement => {
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
            height: 100%;
          }

          .online_players_inner_wrapper :global(.online_players) {
            color: var(--gold);
            font-family: Montserrat;
            text-align: center;
            background: var(--light);
            border: none;
          }

          .online_players_inner_wrapper :global(.row td) {
            font-family: Montserrat;
            color: var(--text);
            padding: 0.5em 1.2em;
            border: none;
          }

          .online_players_inner_wrapper :global(.row:nth-child(odd)) {
            background: var(--light-alt);
          }

          .online_players_inner_wrapper :global(.row:nth-child(even)) {
            background: var(--light);
          }

          .online_players_inner_wrapper :global(table) {
            border: none;
            height: 100%;
          }

          .online_players_inner_wrapper :global(tbody) {
            display: block;
            overflow: auto;
            height: 100%;
          }

          .online_players_inner_wrapper :global(th) {
            padding: ${mobileView ? '0.7em !important' : '0.93em 0.78em'};
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
            background-color: var(--light);
          }

          .online_players_inner_wrapper :global(tbody)::-webkit-scrollbar {
            background-color: var(--light-alt);
          }
        `}
      </style>
    </>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  players: state.lobby.onlinePlayers,
  mobileView: state.system.mobileView,
});

export default connect(
  mapStateToProps,
  null,
)(OnlinePlayers as () => ReactElement);
