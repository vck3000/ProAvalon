import { ReactElement } from 'react';
import { Grid } from 'semantic-ui-react';
import Layout from '../layout/layout';
import TabPane from './tabPane';

interface IGameProps {
  id: string | string[];
}

const GameIndex = ({ id }: IGameProps): ReactElement => {
  return (
    <Layout>
      <Grid.Row style={{ flex: 1 }}>Game {id} Content</Grid.Row>
      <Grid.Row style={{ flex: 1 }}>
        <Grid.Column width={8}>
          <TabPane />
        </Grid.Column>
        <Grid.Column width={8}>
          <TabPane />
        </Grid.Column>
      </Grid.Row>
    </Layout>
  );
};

export default GameIndex;
