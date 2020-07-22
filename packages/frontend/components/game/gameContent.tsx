import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RoomSocketEvents } from '@proavalon/proto/room';
import { RootState } from '../../store';
import { GameButton } from './gameButton';

import { socket } from '../../socket';

type Props = {
  className?: string;
  game: {};
};

const buttonActions = {
  waiting: {
    green: (): void => {
      socket.emit(RoomSocketEvents.SIT_DOWN);
    },
    red: (): void => {
      socket.emit(RoomSocketEvents.STAND_UP);
    },
  },
  game: {
    green: undefined,
    red: undefined,
  },
  finished: {
    green: undefined,
    red: undefined,
  },
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
      <div className="buttonHolder">
        <GameButton
          text="Join"
          type="green"
          event={buttonActions[roomData.state].green}
        />{' '}
        <GameButton
          text="N/A"
          type="red"
          event={buttonActions[roomData.state].red}
        />
      </div>
      <div className="gameBar">{roomData.gameBarMsg}</div>
      <style jsx>
        {`
          .container {
            display: flex;
            flex-flow: column;
          }

          .gameContent {
            flex: 1;
          }

          .buttonHolder {
            display: flex;
            justify-content: space-evenly;
            padding: 5px 0;
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
