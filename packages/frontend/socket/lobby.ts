import { transformAndValidate, Lobby, Game } from '@proavalon/proto';
import SocketEvents = Lobby.SocketEvents;
import LobbyGame = Game.LobbyGame;

export const SetLobbyEvents = (socket: SocketIOClient.Socket): void => {
  socket.on(
    SocketEvents.UPDATE_LOBBY_GAMES,
    async (lobbyGames: LobbyGame[]) => {
      try {
        const LobbyGamesValidated = await transformAndValidate(
          LobbyGame,
          lobbyGames,
        );
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
