import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { MobileView } from '../../store/system/types';

import LobbyDesktop from './lobbyDesktop';
import LobbyMobile from './lobbyMobile';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const LobbyIndex = ({ mobileView }: Props): ReactElement => {
  return mobileView ? <LobbyMobile /> : <LobbyDesktop />;
};

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(LobbyIndex as () => ReactElement);
