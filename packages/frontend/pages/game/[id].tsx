import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Game = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Link href="/">
        <a>
          <img src="/common/logo.png" alt="logo" className="logo" />
        </a>
      </Link>
      Game {id}!
    </>
  );
};

export default Game;
