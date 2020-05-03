import React, { ReactElement, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import { RootState } from '../../store';
import { MobileView } from '../../store/system/types';

import LobbyDesktop from './lobbyDesktop';
import LobbyMobile from './lobbyMobile';
import { getAllChat } from '../../store/chat/actions';
import socket from '../../socket';

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
    socket.reinitialize();

    // Cleanup - is run when user leaves the lobby page at the moment.
    // Perhaps we only want to remove from 'lobby' socket room?
    // and keep the connection alive?
    return (): void => {
      socket.close();
    };
  }, []);

  return mobileView ? <LobbyMobile /> : <LobbyDesktop />;
};

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(LobbyIndex as () => ReactElement);
