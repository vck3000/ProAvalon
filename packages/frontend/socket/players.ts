import SocketEvents from '../proto/socketEvents';
import { store } from '../store';
import { setPlayers } from '../store/players/actions';
import { IPlayer } from '../store/players/actions.types';

export const SetSocketPlayersEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.ONLINE_USERS_TO_CLIENT,
    (onlineUsers: IPlayer['username'][]) => {
      const players = onlineUsers.map((username) => ({
        username,
      }));
      store.dispatch(setPlayers(players));
    },
  );
};
