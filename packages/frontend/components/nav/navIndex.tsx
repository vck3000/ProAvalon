import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { MobileView } from '../../store/system/types';

import NavDesktop from './navDesktop';
import NavMobile from './navMobile';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const NavIndex = ({ mobileView }: Props): ReactElement => {
  return mobileView ? <NavMobile /> : <NavDesktop />;
};

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(NavIndex as () => ReactElement);
