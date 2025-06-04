import axios from 'axios';
import { Phase } from '../gameplay/gameEngine/phases/types';

export const enabledBots = [];
enabledBots.push({
  name: 'SimpleBot',
  urlBase: undefined,
  authorizationKey: undefined,
});

// if (process.env.BOT_DEEPROLE_API_KEY) {
//     enabledBots.push({
//         name: 'DeepRole',
//         urlBase: 'https://deeprole-proavalon.herokuapp.com/deeprole',
//         authorizationKey: process.env.BOT_DEEPROLE_API_KEY,
//     });
//     enabledBots.push({
//         name: 'DebugRole',
//         urlBase: 'https://deeprole-proavalon.herokuapp.com/debug',
//         authorizationKey: process.env.BOT_DEEPROLE_API_KEY,
//     });
// }

export class SimpleBotSocket {
  constructor(username) {
    this.isBotSocket = true;
    this.request = {
      user: {
        username,
        bot: true,
      },
    };
  }

  // Dummy function needed.
  emit() {}

  // handleReadyNotReady: Called when the game is about to start.
  // if the bot is ready, call callback(true)
  // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
  handleReadyNotReady(game, callback) {
    // Simple bots are always ready.
    callback(true);
  }

  // handleGameStart: Called when the game has commenced.
  // if the bot initialized successfully, call callback(true)
  // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
  handleGameStart(game, callback) {
    // Simple bots are always initialized.
    callback(true);
  }

  // handleRequestAction: Called when the server is requesting an action from your bot.
  // When you have a move available, call callback with the selected button and players
  // If you errored, call callback(false)
  handleRequestAction(
    game,
    availableButtons,
    availablePlayers,
    numOfTargets,
    callback,
  ) {
    // Simple bots play randomly
    const buttonPressed =
      availableButtons[Math.floor(Math.random() * availableButtons.length)];
    if (numOfTargets == 0) {
      callback({
        buttonPressed,
      });
    }

    if (numOfTargets && numOfTargets.constructor === Array) {
      numOfTargets = numOfTargets[0];
    }

    // Progressively remove players until it is the right length
    const selectedPlayers = availablePlayers.slice();
    while (selectedPlayers.length > numOfTargets) {
      selectedPlayers.splice(
        Math.floor(Math.random() * selectedPlayers.length),
        1,
      );
    }

    callback({
      buttonPressed,
      selectedPlayers,
    });
  }

  // handleGameOver: Called when the game finishes or closes
  // If you want to leave the room, call callback(true)
  // Otherwise, call callback(false)
  handleGameOver(game, reason, callback) {
    callback(true);
  }
}

export function makeBotAPIRequest(botAPI, method, endpoint, data, timeout) {
  return axios.request({
    method,
    url: botAPI.urlBase + endpoint,
    headers: {
      Authorization: botAPI.authorizationKey,
      'Content-Type': 'application/json',
    },
    data,
    timeout: timeout || 0,
  });
}

function checkBotCapabilities(game, capabilities) {
  // Check if any single capability matches.
  return capabilities.some((capability) => {
    const numPlayers = game.socketsOfPlayers.length;
    if (capability.numPlayers.indexOf(numPlayers) === -1) {
      return false;
    }

    return game.options.every(
      (option) =>
        [Role.Assassin, Role.Merlin].indexOf(option) !== -1 ||
        capability.roles.indexOf(option) !== -1 ||
        capability.cards.indexOf(option) !== -1,
    );
  });
}

export class APIBotSocket {
  constructor(username, botAPI) {
    this.isBotSocket = true;
    this.request = {
      user: {
        username,
        bot: true,
      },
    };
    this.botAPI = botAPI;
  }

  // Dummy function needed.
  emit() {}

  // handleReadyNotReady: Called when the game is about to start.
  // if the bot is ready, call callback(true)
  // if the bot isn't ready, call callback(false) or callback(false, "<reason>")
  handleReadyNotReady(game, callback) {
    // Check if the API supports this game type. If yes, ready up.
    makeBotAPIRequest(this.botAPI, 'GET', '/v0/info', {}, 4000)
      .then((response) => {
        if (response.status !== 200) {
          callback(false, 'Bot returned an invalid response.');
          return;
        }

        const { capabilities } = response.data;

        if (checkBotCapabilities(game, capabilities) === false) {
          callback(false, "Bot doesn't support this game type.");
        } else {
          callback(true);
        }
      })
      .catch((error) => {
        if (error.response) {
          callback(false, 'The bot crashed during request.');
        } else {
          callback(false, 'The bot is no longer online.');
        }
      });
  }

  // handleGameStart: Called when the game has commenced.
  // if the bot initialized successfully, call callback(true)
  // if the bot failed to initialize, call callback(false) or callback(false, "<reason>")
  handleGameStart(game, callback) {
    const thisSocket = this;
    const playerIndex = game.playersInGame.findIndex(
      (player) => player.username == thisSocket.request.user.username,
    );
    // console.log("Player " + thisSocket.request.user.username + " is at index: " + playerIndex); //Don't worry, the above line works perfectly...!
    const gameData = game.getGameData()[playerIndex];

    const apiData = {
      numPlayers: gameData.playerUsernamesOrderedReversed.length,
      roles: gameData.roles.filter(
        (role) => role != Role.Assassin && role != Role.Merlin,
      ), // TODO: Is this needed?
      cards: gameData.cards,
      teamLeader: gameData.teamLeaderReversed,
      players: gameData.playerUsernamesOrderedReversed,
      name: this.request.user.username,
      role: gameData.role,
      see: gameData.see,
    };

    makeBotAPIRequest(this.botAPI, 'POST', '/v0/session', apiData, 3000)
      .then((response) => {
        if (response.status !== 200 || !response.data.sessionID) {
          callback(false, 'Bot returned an invalid response.');
          return;
        }

        thisSocket.sessionID = response.data.sessionID;
        callback(true);
      })
      .catch((error) => {
        if (error.response) {
          callback(false, 'The bot crashed during request.');
        } else {
          callback(false, 'The bot is no longer online.');
        }
      });
  }

  // handleRequestAction: Called when the server is requesting an action from your bot.
  // When you have a move available, call callback with the selected button and players
  // If you errored, call callback(false)
  handleRequestAction(
    game,
    availableButtons,
    availablePlayers,
    numOfTargets,
    callback,
  ) {
    const thisSocket = this;
    const playerIndex = game.playersInGame.findIndex(
      (player) => player.username == thisSocket.request.user.username,
    );
    const gameData = game.getGameData()[playerIndex];

    const apiData = {
      sessionID: this.sessionID,
      gameInfo: gameData,
    };

    makeBotAPIRequest(this.botAPI, 'POST', '/v0/session/act', apiData, 20000)
      .then((response) => {
        if (response.status !== 200) {
          callback(false, 'Bot returned an invalid response.');
          return;
        }

        callback(response.data);
      })
      .catch((error) => {
        if (error.response) {
          callback(false, 'The bot crashed during request.');
          // console.log(error.response);
        } else {
          callback(false, 'The bot is no longer online.');
        }
      });
  }

  // handleGameOver: Called when the game finishes or closes
  // If you want to leave the room, call callback(true)
  // Otherwise, call callback(false)
  handleGameOver(game, reason, callback) {
    const thisSocket = this;
    const playerIndex = game.playersInGame.findIndex(
      (player) => player.username == thisSocket.request.user.username,
    );
    const gameData = game.getGameData()[playerIndex];

    const apiData = {
      sessionID: this.sessionID,
      gameInfo: gameData,
    };

    makeBotAPIRequest(
      this.botAPI,
      'POST',
      '/v0/session/gameover',
      apiData,
      1000,
    );

    callback(game.phase === Phase.Finished);
  }
}

// Old user command code for bots

// getbots: {
//   command: 'getbots',
//     help: '/getbots: Run this in a bot-compatible room. Prints a list of available bots to add, as well as their supported game modes',
//     run(data, senderSocket) {
//     senderSocket.emit('messageCommandReturnStr', {
//       message: 'Bots have been disabled.',
//       classStr: 'server-text',
//     });
//
//     return;
//
//     senderSocket.emit('messageCommandReturnStr', {
//       message: 'Fetching bots...',
//       classStr: 'server-text',
//     });
//
//     const botInfoRequests = enabledBots.map((botAPI) =>
//       makeBotAPIRequest(botAPI, 'GET', '/v0/info', {}, 2000)
//         .then((response) => {
//           if (response.status !== 200) {
//             return null;
//           }
//           return {
//             name: botAPI.name,
//             info: response.data,
//           };
//         })
//         .catch((response) => null),
//     );
//
//     axios.all(botInfoRequests).then((botInfoResponses) => {
//       const botDescriptions = botInfoResponses
//         .filter((result) => result != null)
//         .map(
//           (result) =>
//             `${result.name} - ${JSON.stringify(result.info.capabilities)}`,
//         );
//
//       // Hard code this in... (unshift pushes to the start of the array)
//       botDescriptions.unshift('SimpleBot - Random playing bot...');
//
//       if (botDescriptions.length === 0) {
//         senderSocket.emit('messageCommandReturnStr', {
//           message: 'No bots are currently available.',
//           classStr: 'server-text',
//         });
//       } else {
//         const messages = ['The following bots are online:'].concat(
//           botDescriptions,
//         );
//         senderSocket.emit(
//           'messageCommandReturnStr',
//           messages.map((message) => ({
//             message,
//             classStr: 'server-text',
//           })),
//         );
//       }
//     });
//   },
// },
//
// addbot: {
//   command: 'addbot',
//     help: '/addbot <name> [number]: Run this in a bot-compatible room. Add a bot to the room.',
//     run(data, senderSocket) {
//     senderSocket.emit('messageCommandReturnStr', {
//       message: 'Bots have been disabled.',
//       classStr: 'server-text',
//     });
//
//     return;
//
//     if (
//       senderSocket.request.user.inRoomId === undefined ||
//       rooms[senderSocket.request.user.inRoomId] === undefined
//     ) {
//       return {
//         message: 'You must be in a bot-capable room to run this command!',
//         classStr: 'server-text',
//       };
//     }
//     if (
//       rooms[senderSocket.request.user.inRoomId].gameMode
//         .toLowerCase()
//         .includes('bot') === false
//     ) {
//       return {
//         message:
//           'This room is not bot capable. Please join a bot-capable room.',
//         classStr: 'server-text',
//       };
//     }
//     if (
//       rooms[senderSocket.request.user.inRoomId].host !==
//       senderSocket.request.user.username
//     ) {
//       return {
//         message: 'You are not the host.',
//         classStr: 'server-text',
//       };
//     }
//
//     const currentRoomId = senderSocket.request.user.inRoomId;
//     const currentRoom = rooms[currentRoomId];
//
//     if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
//       return {
//         message: 'No bots can join this room at this time.',
//         classStr: 'server-text',
//       };
//     }
//
//     const { args } = data;
//
//     if (!args[1]) {
//       return {
//         message: 'Specify a bot. Use /getbots to see online bots.',
//         classStr: 'server-text',
//       };
//     }
//     const botName = args[1];
//     const botAPI = enabledBots.find(
//       (bot) => bot.name.toLowerCase() === botName.toLowerCase(),
//     );
//     if (!botAPI && botName !== 'SimpleBot') {
//       return {
//         message: `Couldn't find a bot called ${botName}.`,
//         classStr: 'server-text',
//       };
//     }
//
//     const numBots = +args[2] || 1;
//
//     if (
//       currentRoom.socketsOfPlayers.length + numBots >
//       currentRoom.maxNumPlayers
//     ) {
//       return {
//         message: `Adding ${numBots} bot(s) would make this room too full.`,
//         classStr: 'server-text',
//       };
//     }
//
//     const addedBots = [];
//     for (let i = 0; i < numBots; i++) {
//       const botName = `${botAPI.name}#${Math.floor(Math.random() * 100)}`;
//
//       // Avoid a username clash!
//       const currentUsernames = currentRoom.socketsOfPlayers.map(
//         (sock) => sock.request.user.username,
//       );
//       if (currentUsernames.includes(botName)) {
//         i--;
//         continue;
//       }
//
//       var dummySocket;
//       if (botAPI.name == 'SimpleBot') {
//         dummySocket = new SimpleBotSocket(botName);
//       } else {
//         dummySocket = new APIBotSocket(botName, botAPI);
//       }
//
//       currentRoom.playerJoinRoom(dummySocket);
//       currentRoom.playerSitDown(dummySocket);
//       if (!currentRoom.botSockets) {
//         currentRoom.botSockets = [];
//       }
//       currentRoom.botSockets.push(dummySocket);
//       addedBots.push(botName);
//     }
//
//     if (addedBots.length > 0) {
//       sendToRoomChat(ioGlobal, currentRoomId, {
//         message: `${
//           senderSocket.request.user.username
//         } added bots to this room: ${addedBots.join(', ')}`,
//         classStr: 'server-text-teal',
//       });
//     }
//   },
// },
// rembot: {
//   command: 'rembot',
//     help: '/rembot (<name>|all): Run this in a bot-compatible room. Removes a bot from the room.',
//     run(data, senderSocket) {
//     if (
//       senderSocket.request.user.inRoomId === undefined ||
//       rooms[senderSocket.request.user.inRoomId] === undefined
//     ) {
//       return {
//         message: 'You must be in a bot-capable room to run this command!',
//         classStr: 'server-text',
//       };
//     }
//     if (
//       rooms[senderSocket.request.user.inRoomId].gameMode
//         .toLowerCase()
//         .includes('bot') === false
//     ) {
//       return {
//         message:
//           'This room is not bot capable. Please join a bot-capable room.',
//         classStr: 'server-text',
//       };
//     }
//     if (
//       rooms[senderSocket.request.user.inRoomId].host !==
//       senderSocket.request.user.username
//     ) {
//       return {
//         message: 'You are not the host.',
//         classStr: 'server-text',
//       };
//     }
//
//     const currentRoomId = senderSocket.request.user.inRoomId;
//     const currentRoom = rooms[currentRoomId];
//     const { args } = data;
//
//     if (currentRoom.gameStarted === true || currentRoom.canJoin === false) {
//       return {
//         message: 'No bots can be removed from this room at this time.',
//         classStr: 'server-text',
//       };
//     }
//
//     if (!args[1]) {
//       return {
//         message:
//           'Specify a bot to remove, or use "/rembot all" to remove all bots.',
//         classStr: 'server-text',
//       };
//     }
//     const botName = args[1];
//     const botSockets = currentRoom.botSockets.slice() || [];
//     const botsToRemove =
//       botName === 'all'
//         ? botSockets
//         : botSockets.filter(
//           (socket) =>
//             socket.request.user.username.toLowerCase() ===
//             botName.toLowerCase(),
//         );
//     if (botsToRemove.length === 0) {
//       return {
//         message: "Couldn't find any bots with that name to remove.",
//         classStr: 'server-text',
//       };
//     }
//
//     botsToRemove.forEach((botSocket) => {
//       currentRoom.playerLeaveRoom(botSocket);
//
//       if (
//         currentRoom.botSockets &&
//         currentRoom.botSockets.indexOf(botSocket) !== -1
//       ) {
//         currentRoom.botSockets.splice(
//           currentRoom.botSockets.indexOf(botSocket),
//           1,
//         );
//       }
//     });
//
//     const removedBots = botsToRemove.map(
//       (botSocket) => botSocket.request.user.username,
//     );
//     sendToRoomChat(ioGlobal, currentRoomId, {
//       message: `${
//         senderSocket.request.user.username
//       } removed bots from this room: ${removedBots.join(', ')}`,
//       classStr: 'server-text-teal',
//     });
//   },
// },
