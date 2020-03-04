import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { ThemeOptions } from '../../../store/userOptions/types';

export type MissionHistoryType = 'success' | 'fail' | '';

interface IStateProps {
  theme: ThemeOptions;
}

interface IOwnProps {
  missionHistory: MissionHistoryType[];
}

type Props = IOwnProps & IStateProps;

const MissionHistory = (props: Props): ReactElement => {
  const { missionHistory, theme } = props;
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
            padding-left: 5px;
            padding-top: 5px;
            margin: 0;
          }

          .circle {
            height: 14px;
            width: 14px;
            margin-right: 3px;
            border-radius: 100%;
            border: 1px solid ${theme.colors.TEXT_GRAY};
            background: transparent;
            box-sizing: border-box;
          }

          .success {
            border: 0;
            background-color: ${theme.colors.MISSION_BLUE};
          }

          .fail {
            border: 0;
            background-color: ${theme.colors.MISSION_RED};
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
)(MissionHistory as (props: IOwnProps) => ReactElement);
