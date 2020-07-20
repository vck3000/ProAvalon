import { transformAndValidate } from '@proavalon/proto';
import { SocketEvents, LobbyRoomData } from '@proavalon/proto/lobby';
import { store } from '../store';
import { setLobbyGames } from '../store/lobby/games/actions';

export const SetLobbyEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.UPDATE_LOBBY_GAMES,
    async (lobbyGames: LobbyRoomData[]) => {
      try {
        console.log(lobbyGames); //eslint-disable-line
        const LobbyGamesValidated = await transformAndValidate(
          LobbyRoomData,
          lobbyGames,
        );
        store.dispatch(setLobbyGames(LobbyGamesValidated));
        // eslint-disable-next-line no-console
        console.log('Received lobby games');
        // eslint-disable-next-line no-console
        console.log(LobbyGamesValidated);
      } catch (err) {
        throw Error(`Validation failed. Error: ${err}`);
      }
    },
  );
};
