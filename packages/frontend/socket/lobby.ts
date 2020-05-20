import { transformAndValidate } from '@proavalon/proto';
import { SocketEvents } from '@proavalon/proto/lobby';
import { LobbyGame } from '@proavalon/proto/game';
import { store } from '../store';
import { setLobbyGames } from '../store/lobby/games/actions';

export const SetLobbyEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.UPDATE_LOBBY_GAMES,
    async (lobbyGames: LobbyGame[]) => {
      try {
        const LobbyGamesValidated = await transformAndValidate(
          LobbyGame,
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
