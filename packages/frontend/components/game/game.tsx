import { ReactElement } from 'react';
import { Grid } from 'semantic-ui-react';
import Layout from '../layout/layout';
import TabPane from './tabPane';

interface IGameProps {
  id: string | string[];
}

const Game = ({ id }: IGameProps): ReactElement => {
  return (
    <Layout>
      <Grid style={{ flex: 1 }}>
        <Grid.Row>Game {id} Content</Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <TabPane />
          </Grid.Column>
          <Grid.Column width={8}>
            <TabPane />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Layout>
  );
};

export default Game;
