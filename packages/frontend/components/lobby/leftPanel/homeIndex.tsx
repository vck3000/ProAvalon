import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { MobileView } from '../../../store/system/types';

import HomeDesktop from './homeDesktop';
import HomeMobile from './homeMobile';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const HomeIndex = ({ mobileView }: Props): ReactElement => {
  return mobileView ? <HomeMobile /> : <HomeDesktop />;
};

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(HomeIndex as () => ReactElement);
