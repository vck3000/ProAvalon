import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { playerSelector, missionSelector } from '../../store/game/reducer';
import { IMission } from '../../store/game/types';
import Icon from '../icon';

const getMissionClass = (mission: IMission): string => {
  if (mission.fails === undefined) {
    return 'current';
  }
  if (mission.fails > 0) {
    return 'fail';
  }
  return 'success';
};

const VoteHistory = (): ReactElement => {
  const players = useSelector(playerSelector);
  const missions = useSelector(missionSelector);

  return (
    <table>
      <thead>
        <tr>
          <th aria-label="Players" />
          {missions.map((mission, i) => (
            <th
              className={getMissionClass(mission)}
              colSpan={mission.proposals.length}
            >
              Mission {i + 1}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={player.displayName}>
            <td>{player.displayName}</td>
            {missions.map((mission) =>
              mission.proposals.map((proposal) => (
                <td
                  key={proposal.leader}
                  className={`${
                    proposal.votes[player.displayName] ? 'approve' : 'reject'
                  } ${proposal.leader === player.displayName ? 'leader' : ''}`}
                >
                  {proposal.team.includes(player.displayName) ? (
                    <Icon name="check" />
                  ) : (
                    <></>
                  )}
                </td>
              )),
            )}
          </tr>
        ))}
      </tbody>
      <style jsx>
        {`
          div.container {
            background: var(--light);
            height: 100%;
          }

          table {
            border-spacing: 0.125rem;
            padding: 1rem;
            font-size: 0.875rem;
          }

          div.votes > :not(:first-child) {
            margin-left: 0.25rem;
          }

          th {
            font-weight: 800;
            color: black;
            white-space: nowrap;
          }

          td {
            border: 2px solid transparent;
          }

          td > :global(svg) {
            vertical-align: middle;
            height: 1rem;
          }

          .current {
            background: #ac8c37;
          }

          .success {
            background: var(--mission-blue);
          }

          .fail {
            background: var(--mission-red);
          }

          .approve {
            background: var(--mission-approve);
          }

          .reject {
            background: var(--mission-reject);
          }

          .leader {
            border-color: var(--mission-leader);
          }
        `}
      </style>
    </table>
  );
};

export default VoteHistory;
