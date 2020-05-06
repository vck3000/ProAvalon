import React, { ReactElement, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import { RootState } from '../../store';
import { MobileView } from '../../store/system/types';

import LobbyDesktop from './lobbyDesktop';
import LobbyMobile from './lobbyMobile';
import { getAllChat } from '../../store/chat/actions';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const LobbyIndex = ({ mobileView }: Props): ReactElement => {
  const dispatch = useDispatch();

  // Get all chat on lobby load,
  // after 0.5s to get joined chat.
  useEffect(() => {
    setTimeout(() => {
      dispatch(getAllChat());
    }, 500);
  }, []);

  return mobileView ? <LobbyMobile /> : <LobbyDesktop />;
};

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(LobbyIndex as () => ReactElement);
