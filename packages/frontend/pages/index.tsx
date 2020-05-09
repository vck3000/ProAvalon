import { ReactElement } from 'react';

import LobbyIndex from '../components/lobby/lobbyIndex';
import IndexPage from '../components/index/index';
import useAuth from '../effects/useAuth';

const Index = (): ReactElement => {
  const user = useAuth();

  return user ? <LobbyIndex /> : <IndexPage />;
};

export default Index;
