import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

interface StateProps {
  theme: ThemeOptions;
}

type Props = StateProps;

const SetThisUp = (props: Props): ReactElement => {
  const { theme } = props;
  // Remove the following when you start using theme
  // eslint-disable-next-line no-unused-expressions
  theme;

  return (
    <div className="">
      <style jsx>
        {`
          .replace_me_with_something_useful {
          }
        `}
      </style>
    </div>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  theme: state.userOptions.theme,
});

export default connect(mapStateToProps, null)(SetThisUp as () => ReactElement);
