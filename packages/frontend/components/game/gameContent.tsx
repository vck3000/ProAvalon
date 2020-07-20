import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Props = {
  className?: string;
  game: {};
};

const GameContent = ({ className }: Props): ReactElement => {
  // const [selectedPlayers, setSelectedPlayers] = useState([]);
  const roomData = useSelector((state: RootState) => state.room);
  const roomDataString = JSON.stringify(roomData, null, 4);

  return (
    <div className={`${className} container`}>
      <div className="gameContent">
        Game Content!
        <p className="json">{roomDataString}</p>
      </div>
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

          .json {
            white-space: pre-wrap;
          }
        `}
      </style>
    </div>
  );
};

export default GameContent;
