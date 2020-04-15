import SocketEvents from '../proto/socketEvents';
import { store } from '../store';
import { setOnlinePlayers } from '../store/onlinePlayers/actions';
import { IOnlinePlayer } from '../store/onlinePlayers/actions.types';

export const SetSocketPlayersEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.ONLINE_USERS_TO_CLIENT,
    (onlineUsers: IOnlinePlayer['username'][]) => {
      const players = onlineUsers.map((username) => ({
        username,
      }));
      store.dispatch(setOnlinePlayers(players));
    },
  );
};
