import { ReactElement } from 'react';
import { useRouter } from 'next/router';

import Layout from '../../components/layout/Layout';

const Game = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      Game {id}!
    </Layout>
  );
};

export default Game;
