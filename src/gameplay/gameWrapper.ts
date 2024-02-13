// @ts-nocheck
// This wrapper mainly serves as a way to detect and make callbacks
// to the socket.js file for updates.
import Game, { GameConfig } from './game';
import { SocketUser } from '../sockets/types';
import { Alliance } from './types';

type SocketServerCallback = (action: string, game: GameWrapper) => void;

class GameWrapper extends Game {
  callback: SocketServerCallback;

  constructor(gameConfig: GameConfig, callback: SocketServerCallback) {
    super(gameConfig);

    this.callback = callback;
  }

  //------------------------------------------------
  // METHOD OVERRIDES ------------------------------
  //------------------------------------------------

  // Note: when saving arrays for comparison be sure to take by value instead of by reference.
  playerSitDown(socket: SocketUser) {
    // Store the players in the game before and after to check if a player actually sits.
    const beforePlayers = this.playersInGame.slice(0);

    Game.prototype.playerSitDown.call(this, socket);

    // If the players in the game have changed, callback to update games list.
    if (beforePlayers != this.playersInGame) {
      this.callback('updateCurrentGamesList', undefined);
    }
  }

  playerStandUp(socket: SocketUser) {
    // Store the players in the game before and after to check if a player actually stands.
    const beforePlayers = this.playersInGame.slice(0);

    Game.prototype.playerStandUp.call(this, socket);

    // If the players in the game have changed, callback to update games list.
    if (beforePlayers != this.playersInGame) {
      this.callback('updateCurrentGamesList', undefined);
    }
  }

  startGame(options) {
    const gameStarted = Game.prototype.startGame.call(this, options);

    // If the game actually started, callback to update the games list.
    if (gameStarted) {
      this.callback('updateCurrentGamesList', undefined);
    }
  }

  gameMove(socket: SocketUser, data: any) {
    // Game moves that change these attributes require callbacks.
    const beforeNum = this.missionNum;

    Game.prototype.gameMove.call(this, socket, data);

    // If the mission number has changed, callback to update the games list.
    if (beforeNum != this.missionNum) {
      this.callback('updateCurrentGamesList', undefined);
    }
  }

  canRoomChat(usernameLower: string) {
    return Game.prototype.canRoomChat.call(this, usernameLower);
  }

  // No need to track phase, a call to finishGame always causes the phase of the game to change to finished.
  finishGame(toBeWinner: Alliance) {
    Game.prototype.finishGame.call(this, toBeWinner);

    // If the game actually finished, then run callbacks.
    if (this.finished === true) {
      // Callbacks for announcing winner in all chat.
      if (this.winner === Alliance.Spy) {
        this.callback('finishGameSpyWin', this);
      } else if (this.winner === Alliance.Resistance) {
        this.callback('finishGameResWin', this);
      } else {
        // Something went wrong...
        throw new ReferenceError(
          `${this.winner} was not recognised as a winner.`,
        );
      }

      // Callback for updating the games list.
      this.callback('updateCurrentGamesList', undefined);

      if (this.ranked) {
        // Callback for adjusting rating brackets based on elo changes and making rank change announcements.
        const beforeRanks = this.playersInGame.map(function (player) {
          const data = {
            username: player.request.user.username,
            ratingBracket: player.request.user.ratingBracket,
          };
          return data;
        });

        this.callback('adjustRatingBrackets', this);

        const afterRanks = this.playersInGame.map(function (player) {
          const data = {
            username: player.request.user.username,
            ratingBracket: player.request.user.ratingBracket,
          };
          return data;
        });

        // Make the announcements if needed.
        if (beforeRanks != afterRanks) {
          // Check through the afterRanks to see which users need announcements.
          for (let i = 0; i < afterRanks.length; i++) {
            for (let j = 0; j < beforeRanks.length; j++) {
              if (
                beforeRanks[j].username === afterRanks[i].username &&
                beforeRanks[j].ratingBracket != afterRanks[i].ratingBracket
              ) {
                const username = afterRanks[i].username;
                const oldRank = beforeRanks[j].ratingBracket;
                const newRank = afterRanks[i].ratingBracket;

                // Very dirty implementation, adjust rating brackets to objects with in built ordering?
                if (
                  (oldRank === 'champion' && newRank === 'diamond') ||
                  (oldRank === 'diamond' && newRank === 'platinum') ||
                  (oldRank === 'platinum' && newRank === 'gold') ||
                  (oldRank === 'gold' && newRank === 'silver') ||
                  (oldRank === 'silver' && newRank === 'bronze') ||
                  (oldRank === 'bronze' && newRank === 'iron')
                ) {
                  this.sendText(
                    this.allSockets,
                    `${username} has been demoted to ${
                      newRank.charAt(0).toUpperCase() + newRank.slice(1)
                    }.`,
                    'all-chat-text-red',
                  );
                } else {
                  this.sendText(
                    this.allSockets,
                    `${username} has been promoted to ${
                      newRank.charAt(0).toUpperCase() + newRank.slice(1)
                    }!`,
                    'all-chat-text-blue',
                  );
                }
                break;
              }
            }
          }
        }
        // Callback to update the players list to show the adjusted ratings and brackets.
        this.callback('updateCurrentPlayersList', this);
      }
    }
  }
}

export default GameWrapper;
