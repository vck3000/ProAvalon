import { SocketEvents } from '../proto/lobbyProto';
import { store } from '../store';
import { setOnlinePlayers } from '../store/onlinePlayers/actions';
import { IOnlinePlayer } from '../store/onlinePlayers/actions.types';

export const SetSocketPlayersEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.ONLINE_PLAYERS,
    (onlineUsers: IOnlinePlayer['username'][]) => {
      const players = onlineUsers.map((username) => ({
        username,
      }));
      store.dispatch(setOnlinePlayers(players));
    },
  );
};
