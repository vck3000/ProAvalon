import { ReactElement } from 'react';
import css from 'styled-jsx/css';
import Layout from '../layout/layout';
import TabPane from './tabPane';
import useGame from './useGame';
import GameContent from './gameContent';

interface IGameProps {
  gameID?: string | string[];
}

const { styles, className } = css.resolve`
  .gameContent {
    flex: 1;
  }

  .tabContainer {
    flex: 1;
    display: flex;
  }

  .tabPane {
    flex: 1;
    padding: 1rem;
    box-sizing: border-box; /* tabPane has height 100%, need this for padding*/
  }
`;

const getClass = (classes: string): string => `${className} ${classes}`;

const GameIndex = ({ gameID }: IGameProps): ReactElement => {
  useGame(gameID);

  return (
    <Layout>
      <GameContent className={getClass('gameContent')} game={{}} />
      <div className={getClass('tabContainer')}>
        <TabPane className={getClass('tabPane')} />
        <TabPane className={getClass('tabPane')} />
      </div>
      {styles}
    </Layout>
  );
};

export default GameIndex;
