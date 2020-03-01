import React, { ReactElement } from 'react';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { COMMON_COLORS } from '../colors';
import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

const { GOLD } = COMMON_COLORS;

type Reward = 'badge' | 'winner';

interface Player {
  username: string;
  extras?: [Reward];
}

interface OwnProps {
  players: Player[];
  maxHeight?: string;
}
interface StateProps {
  theme: ThemeOptions;
}

type Props = OwnProps & StateProps;

const OnlinePlayers = (props: Props): ReactElement => {
  const { players, theme, maxHeight } = props;
  const numPlayers = players.length;

  const useMaxHeight = maxHeight || '100%';
  return (
    <div>
      <div style={{ maxHeight: useMaxHeight }} className="wrapper">
        <Table celled compact unstackable style={{ background: 'transparent' }}>
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

      <style jsx>
        {`
          .list {
            border: 1px solid red;
          }

          .wrapper {
            height: 100%;
            overflow: auto;
          }

          .wrapper :global(.online_players) {
            color: ${GOLD};
            font-family: Montserrat-Bold;
            text-align: center;
            background: #212121;
          }

          .wrapper :global(.row td) {
            font-family: Montserrat-Bold;
            color: ${theme.colors.COLOR};
            padding: 0.5em 1.2em;
          }

          .wrapper :global(.row:nth-child(odd)) {
            background: #2f2e2a;
          }

          .wrapper :global(.row:nth-child(even)) {
            background: #212121;
          }
        `}
      </style>
    </div>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  theme: state.userOptions.theme,
});

export default connect(
  mapStateToProps,
  null,
)(OnlinePlayers as (props: OwnProps) => ReactElement);
