import React, { ReactElement } from 'react';

export type MissionHistoryType = 'success' | 'fail' | '';

interface IOwnProps {
  missionHistory: MissionHistoryType[];
}

const MissionHistory = (props: IOwnProps): ReactElement => {
  const { missionHistory } = props;
  while (missionHistory.length < 5) {
    missionHistory.push('');
  }
  return (
    <>
      <div className="wrapper">
        {missionHistory.map((mission, i) => (
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
