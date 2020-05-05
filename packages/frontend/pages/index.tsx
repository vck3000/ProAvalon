import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import LobbyIndex from '../components/lobby/lobbyIndex';
import IndexPage from '../components/index/index';
import useAuth from '../effects/useAuth';

const Index = (): ReactElement => {
  useAuth();

  const user = useSelector<RootState>((state) => state.auth.user);

  return user ? <LobbyIndex /> : <IndexPage />;
};

export default Index;
