import { ReactElement } from 'react';

type Props = {
  className?: string;
  game: {};
};

const GameContent = ({ className }: Props): ReactElement => {
  // const [selectedPlayers, setSelectedPlayers] = useState([]);

  return (
    <div className={`${className} container`}>
      <div className="gameContent">Game Content!</div>
      <div className="gameBar">Waiting on skipkayhil...</div>
      <style jsx>
        {`
          .container {
            display: flex;
            flex-flow: column;
          }

          .gameContent {
            flex: 1;
          }

          .gameBar {
            background: var(--light-alt);
            padding: 1rem;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};

export default GameContent;
