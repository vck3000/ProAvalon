import React, { ReactElement } from 'react';
import { MissionOutcome } from '@proavalon/proto/game';

interface IOwnProps {
  missionOutcome?: MissionOutcome[];
}

const MissionHistory = ({ missionOutcome }: IOwnProps): ReactElement => {
  let outcome: string[] = [...(missionOutcome as string[])];

  if (!outcome) {
    outcome = [];
  }
  while (outcome.length < 5) {
    outcome.push('undefined');
  }
  return (
    <>
      <div className="wrapper">
        {outcome.map((mission: string, i: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className={`circle ${mission}`} />
        ))}
      </div>
      <style jsx>
        {`
          .wrapper {
            display: flex;
            padding: 8px 0;
            margin: 0;
          }

          .circle {
            height: 14px;
            width: 14px;
            margin-right: 3px;
            border-radius: 100%;
            border: 1px solid var(--text-gray);
            background: transparent;
            box-sizing: border-box;
          }

          .success {
            border: 0;
            background-color: var(--mission-blue);
          }

          .fail {
            border: 0;
            background-color: var(--mission-red);
          }
        `}
      </style>
    </>
  );
};

export default MissionHistory;
