import { ReactElement } from 'react';
import Layout from '../layout/layout';
import TabPane from './tabPane';
import useGame from './useGame';

interface IGameProps {
  id: string | string[];
}

const GameIndex = ({ id }: IGameProps): ReactElement => {
  const gameID = Number(id);

  useGame(gameID);

  return (
    <Layout>
      <div style={{ flex: 1 }}>Game {gameID} Content</div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1, padding: '1rem' }}>
          <TabPane />
        </div>
        <div style={{ flex: 1, padding: '1rem' }}>
          <TabPane />
        </div>
      </div>
    </Layout>
  );
};

export default GameIndex;
