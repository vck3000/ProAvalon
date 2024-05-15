// @ts-nocheck
import { GAME_MODE_NAMES, GameMode } from './gameModes';
import { SocketUser } from '../sockets/types';
import Game, { MIN_PLAYERS } from './game';
import { Timeouts } from './gameTimer';
import { ReadyPrompt } from '../sockets/readyPrompt';
import { avalonRoles } from './roles/roles';
import { avalonCards } from './cards/cards';
import { avalonPhases, commonPhases } from './phases/phases';
import { Role } from './roles/types';
import { Phase } from './phases/types';
import { millisToStr } from '../util/time';
import { RoomPlayer } from './types';

export class RoomConfig {
  host: string;
  roomId: number;
  io: any;
  maxNumPlayers: number;
  newRoomPassword: string;
  gameMode: GameMode;
  ranked: boolean;
  readyPrompt: ReadyPrompt;

  constructor(
    host: string,
    roomId: number,
    io: any,
    maxNumPlayers: number,
    newRoomPassword: string,
    gameMode: GameMode,
    ranked: boolean,
    readyPrompt: ReadyPrompt,
  ) {
    this.host = host;
    this.roomId = roomId;
    this.io = io;
    this.maxNumPlayers = this.boundMaxNumPlayers(maxNumPlayers);
    this.newRoomPassword = this.processNewRoomPassword(newRoomPassword);
    this.gameMode = gameMode;
    this.ranked = ranked;
    this.readyPrompt = readyPrompt;
  }

  boundMaxNumPlayers(num: number) {
    // Default to 10 if out of range.
    if (num < 5 || num > 10) {
      return 10;
    }

    return num;
  }

  processNewRoomPassword(str: string) {
    if (str === '') {
      return undefined;
    }

    return str;
  }
}

class Room {
  host: string;
  roomId: number;
  io: any;
  maxNumPlayers: number;
  joinPassword: string;
  gameMode: GameMode;
  ranked: boolean;

  allSockets: SocketUser[];
  socketsOfPlayers: SocketUser[];
  botSockets: Socket[];

  claimingPlayers: Set<string> = new Set();

  lockJoin = false;
  readyPrompt: ReadyPrompt;

  constructor(roomConfig: RoomConfig) {
    // Expand config
    this.host = roomConfig.host;
    this.roomId = roomConfig.roomId;
    this.io = roomConfig.io;
    this.maxNumPlayers = roomConfig.maxNumPlayers;
    this.joinPassword = roomConfig.newRoomPassword;
    this.gameMode = roomConfig.gameMode;
    this.ranked = roomConfig.ranked;
    this.readyPrompt = roomConfig.readyPrompt;

    this.gamesRequiredForRanked = 0;
    this.provisionalGamesRequired = 20;

    // Sockets
    this.allSockets = [];
    this.socketsOfPlayers = [];
    this.botSockets = [];

    // Arrays containing lower cased usernames
    this.kickedPlayers = [];

    // Phases Cards and Roles to use
    this.commonPhases = this.initialiseGameDependencies(commonPhases);
    this.specialRoles = this.initialiseGameDependencies(avalonRoles);
    this.specialPhases = this.initialiseGameDependencies(avalonPhases);
    this.specialCards = this.initialiseGameDependencies(avalonCards);
  }

  playerJoinRoom(socket, inputPassword) {
    console.log(
      `${socket.request.user.username} has joined room ${this.roomId}`,
    );

    // check if the player is a moderator or an admin, if so bypass
    if (!(socket.isModSocket || socket.isAdminSocket)) {
      // if the room has a password and user hasn't put one in yet
      if (
        this.joinPassword !== undefined &&
        inputPassword === undefined &&
        (socket.isBotSocket === undefined || socket.isBotSocket === false)
      ) {
        socket.emit('joinPassword', this.roomId);
        // console.log("No password inputted!");

        return false;
      }
      // if the room has a password and user HAS put a password in
      if (
        this.joinPassword !== undefined &&
        inputPassword !== undefined &&
        (socket.isBotSocket === undefined || socket.isBotSocket === false)
      ) {
        if (this.joinPassword === inputPassword) {
          // console.log("Correct password!");

          socket.emit('correctRoomPassword');
          // continue on
        } else {
          // console.log("Wrong password!");

          // socket.emit("danger-alert", "The password you have inputted is incorrect.");
          socket.emit('wrongRoomPassword');
          socket.emit('changeView', 'lobby');
          return false;
        }
      }
    }

    this.allSockets.push(socket);

    this.updateRoomPlayers();

    this.sendOutGameModesInRoomToSocket(socket);

    // If a player joins the game while empty ensure that the destruction process is aborted
    if (this.destroyRoom) {
      this.destroyRoom = false;
      clearTimeout(this.destroyTimeoutObj);
      console.log(
        `Player joined empty room ${this.roomId}, destruction aborted.`,
      );
    }

    return true;
  }

  playerSitDown(socket) {
    if (this.lockJoin) {
      return;
    }

    const socketUsername = socket.request.user.username;

    if (
      socketUsername === this.host &&
      this.gameMode.toLowerCase().includes('bot') === true
    ) {
      const data = {
        message:
          'Type /help to see the commands available to interact with bots!',
        classStr: 'server-text',
        dateCreated: new Date(),
      };
      socket.emit('roomChatToClient', data);
    }

    // If they were kicked and banned
    if (this.kickedPlayers.indexOf(socketUsername.toLowerCase()) !== -1) {
      socket.emit(
        'danger-alert',
        'The host has kicked you from this room. You cannot join.',
      );
      return;
    }
    // If there are too many players already sitting down
    if (this.socketsOfPlayers.length >= this.maxNumPlayers) {
      socket.emit(
        'danger-alert',
        'The game has reached the limit for number of players.',
      );
      return;
    }
    // If the room is ranked and the player doesn't have enough games to sit.
    if (
      this.ranked &&
      socket.request.user.totalGamesPlayed < this.gamesRequiredForRanked
    ) {
      socket.emit(
        'danger-alert',
        `You do not have the required experience to sit in ranked games. Please play ${this.gamesRequiredForRanked} unranked games first.`,
      );
      return;
    }
    // If they already exist, no need to add
    if (this.socketsOfPlayers.indexOf(socket) !== -1) {
      return;
    }

    // If the socket passes all the tests, then push them
    this.socketsOfPlayers.push(socket);

    this.updateRoomPlayers();
  }

  playerStandUp(socket) {
    if (this.lockJoin) {
      return;
    }

    // Grab their index
    const index = this.socketsOfPlayers.indexOf(socket);
    // If they are on the list of sockets of players,
    if (index !== -1) {
      this.socketsOfPlayers.splice(index, 1);
      this.updateRoomPlayers();
    }
  }

  playerLeaveRoom(socket) {
    // In case they were sitting down, remove them
    this.playerStandUp(socket);

    // Remove them from all sockets
    const index = this.allSockets.indexOf(socket);
    if (index !== -1) {
      this.allSockets.splice(index, 1);
    }

    let newHostSocket;
    // Set the host to the first person in the sitting down array in case the previous host left
    if (this.socketsOfPlayers[0] !== undefined && this.gameStarted === false) {
      newHostSocket = this.socketsOfPlayers[0];
      const oldHost = this.host;
      this.host = this.socketsOfPlayers[0].request.user.username;

      if (
        this.gameMode.toLowerCase().includes('bot') === true &&
        oldHost !== this.host
      ) {
        const data = {
          message:
            'Type /help to see the commands available to interact with bots!',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
        newHostSocket.emit('roomChatToClient', data);
      }

      console.log(`new host: ${this.host}`);
    }

    // Destroy room if there's no one in it anymore
    if (this.allSockets.length === 0 && this.phase !== Phase.Frozen) {
      console.log(`Room: ${this.roomId} is empty, attempting to destroy...`);
      this.destroyRoom = true;
    }

    this.updateRoomPlayers();

    // If the new host is a bot... leave the room.
    if (newHostSocket !== undefined && newHostSocket.isBotSocket === true) {
      this.playerLeaveRoom(newHostSocket);
    }
  }

  kickPlayer(username, socket) {
    if (this.host === socket.request.user.username) {
      // Get the socket of the target
      let socketOfTarget = null;
      for (let i = 0; i < this.allSockets.length; i++) {
        if (username === this.allSockets[i].request.user.username) {
          socketOfTarget = this.allSockets[i];
        }
      }
      if (socketOfTarget === null) {
        return;
      }

      // Make them stand up forcefully
      this.playerStandUp(socketOfTarget);

      if (socketOfTarget.isBotSocket) {
        this.playerLeaveRoom(socketOfTarget);
      }

      // Add to kickedPlayers array
      this.kickedPlayers.push(username.toLowerCase());
      const kickMsg = `Player ${username} has been kicked by ${this.host}.`;
      this.sendText(kickMsg, 'server-text');
      // console.log(kickMsg);
      this.updateRoomPlayers();
    }
  }

  setClaim(socket, data) {
    // data presents whether they want to CLAIM (true) or UNCLAIM (false)

    const username = socket.request.user.username;

    if (data) {
      this.claimingPlayers.add(username);
    } else {
      this.claimingPlayers.delete(username);
    }

    this.updateRoomPlayers();
  }

  // Note this sends text to ALL players and ALL spectators
  sendText(incString, stringType) {
    const data = {
      message: incString,
      classStr: stringType,
      dateCreated: new Date(),
    };
    for (let i = 0; i < this.allSockets.length; i++) {
      const tmpSocket = this.allSockets[i];
      if (tmpSocket && typeof tmpSocket !== 'undefined') {
        tmpSocket.emit('roomChatToClient', data);
      }
    }

    if (this.gameStarted && this.gameStarted === true) {
      this.addToChatHistory(data);
    }

    console.log(`[Room Chat] [Room ${this.roomId}] ${incString}`);
  }

  updateRoomPlayers() {
    // Get the usernames of spectators
    const usernamesOfSpecs = [];
    const socketsOfSpectators = this.getSocketsOfSpectators();
    socketsOfSpectators.forEach((sock) => {
      const dispUsername = sock.request.displayUsername
        ? sock.request.displayUsername
        : sock.request.user.username;
      usernamesOfSpecs.push(dispUsername);
    });
    // Sort the usernames
    usernamesOfSpecs.sort((a, b) => {
      const textA = a.toUpperCase();
      const textB = b.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

    // Send the data to all sockets within the room.
    for (let i = 0; i < this.allSockets.length; i++) {
      const tmpSocket = this.allSockets[i];
      if (tmpSocket && typeof tmpSocket !== 'undefined') {
        tmpSocket.emit('update-room-players', this.getRoomPlayers());
        tmpSocket.emit('update-room-spectators', usernamesOfSpecs);
        tmpSocket.emit('update-room-info', {
          maxNumPlayers: this.maxNumPlayers,
        });
      }
    }
  }

  getRoomPlayers(): RoomPlayer[] {
    const roomPlayers = [];

    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      const isClaiming = this.claimingPlayers.has(
        this.socketsOfPlayers[i].request.user.username,
      );

      roomPlayers[i] = {
        username: this.socketsOfPlayers[i].request.user.username,
        avatarImgRes: this.socketsOfPlayers[i].request.user.avatarImgRes,
        avatarImgSpy: this.socketsOfPlayers[i].request.user.avatarImgSpy,
        avatarHide: this.socketsOfPlayers[i].request.user.avatarHide,
        claim: isClaiming,
      };

      // give the host the teamLeader star
      if (roomPlayers[i].username === this.host) {
        roomPlayers[i].teamLeader = true;
      }
    }

    return roomPlayers;
  }

  getSocketsOfSpectators() {
    // slice to create a new complete copy of allSOckets
    const socketsOfSpecs = this.allSockets.slice();

    // If there is a socket that is sitting down within the socketsOfSpecs (which was at first a clone of allSockets)
    // then remove that socket. Do this for all socketsOfPlayers
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      const index = socketsOfSpecs.indexOf(this.socketsOfPlayers[i]);
      if (index !== -1) {
        socketsOfSpecs.splice(index, 1);
      }
    }

    return socketsOfSpecs;
  }

  updateMaxNumPlayers(socket, number) {
    number = parseInt(number, 10);
    if (isNaN(number)) {
      return;
    }

    if (
      socket.request.user.username === this.host &&
      number >= 5 &&
      number <= 10
    ) {
      this.maxNumPlayers = number;
      this.updateRoomPlayers();
    }
  }

  updateRanked(socket, rankedType) {
    if (this.gameStarted) {
      return;
    }

    if (rankedType !== 'ranked' && rankedType !== 'unranked') {
      return;
    }

    if (this.gameMode === GameMode.AVALON_BOT) {
      return;
    }

    if (this.joinPassword && rankedType === 'ranked') {
      this.sendText(
        'This room is private and therefore cannot be ranked.',
        'server-text',
      );
      return;
    }

    if (socket.request.user.username === this.host) {
      this.ranked = rankedType === 'ranked';
    }
    const rankedChangeMsg = `This room is now ${rankedType}.`;
    this.sendText(rankedChangeMsg, 'server-text');
  }

  updateGameModesInRoom(socket, gameMode: GameMode) {
    if (this.gameStarted) {
      return;
    }

    if (
      GAME_MODE_NAMES.includes(gameMode) === true &&
      socket.request.user.username === this.host
    ) {
      // If the new gameMode doesnt include bot, but originally does, then remove the bots that may have been added
      if (
        gameMode.toLowerCase().includes('bot') == false &&
        this.botSockets !== undefined &&
        this.botSockets.length > 0
      ) {
        const botSockets = this.botSockets.slice() || [];
        const botsToRemove = botSockets;
        botsToRemove.forEach((botSocket) => {
          this.playerLeaveRoom(botSocket);

          if (this.botSockets && this.botSockets.indexOf(botSocket) !== -1) {
            this.botSockets.splice(this.botSockets.indexOf(botSocket), 1);
          }
        });
        const removedBots = botsToRemove.map(
          (botSocket) => botSocket.request.user.username,
        );

        if (removedBots.length > 0) {
          const message = `${
            socket.request.user.username
          } removed bots from this room: ${removedBots.join(', ')}`;
          const classStr = 'server-text-teal';
          this.sendText(message, classStr);
        }
      }

      if (gameMode.toLowerCase().includes('bot') === true) {
        // Get host socket
        const hostSock = this.socketsOfPlayers[0];
        const data = {
          message:
            'Type /help to see the commands available to interact with bots!',
          classStr: 'server-text',
          dateCreated: new Date(),
        };
        hostSock.emit('roomChatToClient', data);
      }

      this.gameMode = gameMode;

      this.specialRoles = this.initialiseGameDependencies(avalonRoles);
      this.specialPhases = this.initialiseGameDependencies(avalonPhases);
      this.specialCards = this.initialiseGameDependencies(avalonCards);

      // Send the data to all sockets within the room.
      for (let i = 0; i < this.allSockets.length; i++) {
        if (this.allSockets[i]) {
          this.sendOutGameModesInRoomToSocket(this.allSockets[i]);
        }
      }
    } else {
      socket.emit(
        'danger-alert',
        'Error happened when changing Game Mode. Let the admin know if you see this.',
      );
    }
  }

  sendOutGameModesInRoomToSocket(targetSocket) {
    // Get the names and descriptions of roles and cards to send to players
    const roleNames = [];
    const roleDescriptions = [];
    const roleAlliances = [];
    const rolePriorities = [];
    const cardNames = [];
    const cardDescriptions = [];
    const cardPriorities = [];

    const skipRoles = [Role.Resistance, Role.Spy];

    for (let key in this.specialRoles) {
      if (this.specialRoles.hasOwnProperty(key) === true) {
        // Skip Resistance and Spy since they are default roles always enabled.
        if (skipRoles.includes(this.specialRoles[key].role) === true) {
          continue;
        }

        roleNames.push(this.specialRoles[key].role);
        roleDescriptions.push(this.specialRoles[key].description);
        roleAlliances.push(this.specialRoles[key].alliance);
        if (!this.specialRoles[key].orderPriorityInOptions) {
          rolePriorities.push(0);
        } else {
          rolePriorities.push(this.specialRoles[key].orderPriorityInOptions);
        }
      }
    }

    for (var key in this.specialCards) {
      if (this.specialCards.hasOwnProperty(key) === true) {
        cardNames.push(this.specialCards[key].card);
        cardDescriptions.push(this.specialCards[key].description);
        if (!this.specialCards[key].orderPriorityInOptions) {
          cardPriorities.push(0);
        } else {
          cardPriorities.push(this.specialCards[key].orderPriorityInOptions);
        }
      }
    }

    const obj = {
      // Todo: Send over the roles/cards in the gamemode. Upon changing gamemode, resend.
      gameModes: GAME_MODE_NAMES,
      roles: {
        roleNames,
        alliances: roleAlliances,
        descriptions: roleDescriptions,
        orderPriorities: rolePriorities,
      },
      cards: {
        cardNames,
        descriptions: cardDescriptions,
        orderPriorities: cardPriorities,
      },
    };

    // Send the data to the socket.
    targetSocket.emit('update-game-modes-in-room', obj);
  }

  hostTryStartGame(
    options: string[],
    gameMode: string,
    timeouts: Timeouts,
    anonymousMode: boolean,
  ) {
    if (this.gameStarted === true) {
      return false;
    }

    if (this.socketsOfPlayers.length < MIN_PLAYERS) {
      this.socketsOfPlayers[0].emit(
        'danger-alert',
        'Minimum 5 players to start. ',
      );
      return false;
    }

    const checkOptions = Game.checkOptions(options);
    if (!checkOptions.success) {
      this.socketsOfPlayers[0].emit('danger-alert', checkOptions.errMessage);
      return false;
    }

    // Can't start game if joining is locked as well.
    // Will unlock when existing readyPrompt times out or is rejected.
    if (this.lockJoin) {
      return;
    }

    this.lockJoin = true;

    this.options = options;
    this.gameMode = gameMode;

    let rolesInStr = '';
    options.forEach((element) => {
      rolesInStr += `${element}, `;
    });
    // remove the last , and replace with .
    rolesInStr = rolesInStr.slice(0, rolesInStr.length - 2);
    rolesInStr += '.';

    rolesInStr += `<br>Ranked: ${this.ranked}`;
    rolesInStr += `<br>Mute Spectators: ${this.muteSpectators}`;
    rolesInStr += `<br>Default timeout: ${millisToStr(timeouts.default)}`;
    rolesInStr += `<br>Assassination timeout: ${millisToStr(
      timeouts.assassination,
    )}`;
    rolesInStr += `<br>Anonymous mode: ${anonymousMode}`;

    this.sendText('The game is starting!', 'gameplay-text');

    this.getSocketsOfSpectators().forEach((sock) => {
      sock.emit('spec-game-starting', null);
    });

    this.readyPrompt.createReadyPrompt(
      this.socketsOfPlayers,
      'Game starting!',
      rolesInStr,
      (
        success: boolean,
        acceptedUsernames: string[],
        rejectedUsernames: string[],
      ): void => {
        if (success) {
          this.startGame(this.options);
        } else {
          this.getSocketsOfSpectators().forEach((sock) => {
            sock.emit('spec-game-starting-finished', null);
          });

          for (const rejectedUsername of rejectedUsernames) {
            this.sendText(`${rejectedUsername} is not ready.`, 'server-text');
          }

          this.lockJoin = false;
        }
      },
    );
  }

  initialiseGameDependencies = (
    // TODO replace any with a room initialisable interface
    obj: Record<string, { new (a: Room): any }>,
  ) => {
    const initialisedGameDependencies: Record<string, any> = {};
    for (const key in obj) {
      initialisedGameDependencies[key] = new obj[key](this);
    }

    return initialisedGameDependencies;
  };
}

export default Room;
