import { Server as SocketServer, Socket } from 'socket.io';
import { SocketUser } from './types';

import { AVALON } from '../gameplay/gameModes';

// @ts-ignore
import debounce from 'lodash.debounce';

import { MatchMakingQueueItem } from '../match/MatchMakingQueueItem';
import { matchMakePlayers } from '../match/matchMakingFunction';

import { getSocketFromUsername, newRoom, rooms, joinRoom } from './sockets';

// Unranked queue variables
let unrankedQueue6Players: MatchMakingQueueItem[] = [];
let prospectivePlayersFor6UQ: MatchMakingQueueItem[] = [];
let readyPlayersFor6UQ: MatchMakingQueueItem[] = [];
let timeout: any;

// Ranked queue variables
let rankedQueue6Players: MatchMakingQueueItem[] = [];
let prospectivePlayersFor6RQ: MatchMakingQueueItem[] = [];
let readyPlayersFor6RQ: MatchMakingQueueItem[] = [];
let timeout2: any;
let isMatching = false;

// Add player to queue, and start match if six players in queue
function joinUnrankedQueue(dataObj: { numPlayers: number; }) {
  // add player to queue
  // First if checks if player is joining the six-player game or not
  if (dataObj.numPlayers !== 6) {
    // if number of players in queue >= 6, ask for confirmation to join game
    this.emit('invalid-player-count');
    return
  } else if (
    !unrankedQueue6Players.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    ) &&
    !prospectivePlayersFor6UQ.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    ) &&
    !readyPlayersFor6UQ.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    )
  ) {
    unrankedQueue6Players.push({
      username: this.request.user.username.toLowerCase(),
      timeJoinedAt: Date.now(),
    });
    // console.log(unrankedQueue6Players.length);
    console.log('List of players:');
    console.log(unrankedQueue6Players.map((player) => player.username));
    // if number of players in queue < 6, return null
    // Second if checks if there are enough players for a six-player game
    if (unrankedQueue6Players.length >= 6 && prospectivePlayersFor6UQ.length == 0 && readyPlayersFor6UQ.length == 0) {
      checkForUnrankedConfirmation();
    } else {
      return;
    }
  } else {
    return;
  }
}

// Ask each player to confirm they are ready to join
function checkForUnrankedConfirmation() {
  prospectivePlayersFor6UQ = unrankedQueue6Players.splice(0, 6);
  console.log('List of players:');
  console.log(prospectivePlayersFor6UQ.map((player) => player.username));
  prospectivePlayersFor6UQ.forEach((prospectivePlayer) => {
    // emit to each player asking for confirmation
    const playerSocket: SocketUser = getSocketFromUsername(
      prospectivePlayer.username.toLowerCase(),
    );
    playerSocket.emit('confirm-ready-to-play');
  });

  // setTimeout for 120 seconds; if readyPlayers.length != 6, terminate
  timeout = setTimeout(() => {
    if (prospectivePlayersFor6UQ.length > 0) {
      unrankedQueue6Players.push(...readyPlayersFor6UQ);
      readyPlayersFor6UQ = [];
      prospectivePlayersFor6UQ = [];
    }
    if (unrankedQueue6Players.length >= 6 && prospectivePlayersFor6UQ.length == 0 && readyPlayersFor6UQ.length == 0) {
      checkForUnrankedConfirmation();
    }
  }, 120000)

}

// remove player from queue
function leaveUnrankedQueue() {
  // remove player from queue
  const userName = this.request.user.username.toLowerCase();
  const indexToRemove: number = unrankedQueue6Players.findIndex(
    (player) => player.username === userName,
  );
  if (indexToRemove !== -1) {
    unrankedQueue6Players.splice(indexToRemove, 1);
    console.log(unrankedQueue6Players.length);
    this.emit('leave-queue');
  } else {
    this.emit('invalid-removal-attempt');
  }
}

function readyUnrankedGame(dataObj: { playerReady: any; }) {
  // if a player accepts, add them to the list of ready players
  const selectedProspectivePlayer = prospectivePlayersFor6UQ.findIndex(
    (player) => player.username === this.request.user.username.toLowerCase(),
  );
  if (!dataObj.playerReady) {
    const decliningPlayer = this.request.user.username;
    // if a player rejects or times out, add other players to queue
    [...prospectivePlayersFor6UQ, ...readyPlayersFor6UQ].forEach((prospectivePlayer) => {
      // emit to each player informing that the player has cancelled.
      const playerSocket: SocketUser = getSocketFromUsername(
        prospectivePlayer.username.toLowerCase(),
      );
      playerSocket.emit('declined-to-play', {
        decliningPlayer,
        username: prospectivePlayer.username,
      });
    });
    prospectivePlayersFor6UQ.splice(selectedProspectivePlayer, 1);
    unrankedQueue6Players = [
      ...unrankedQueue6Players,
      ...prospectivePlayersFor6UQ,
      ...readyPlayersFor6UQ
    ];
    prospectivePlayersFor6UQ = [];
    readyPlayersFor6UQ = [];
    unrankedQueue6Players.sort((a, b) => a.timeJoinedAt - b.timeJoinedAt);
    if (unrankedQueue6Players.length >= 6 && prospectivePlayersFor6UQ.length == 0 && readyPlayersFor6UQ.length == 0) {
      checkForUnrankedConfirmation();
    }
  } else if (selectedProspectivePlayer === -1) {
    return;
  } else if (dataObj.playerReady && selectedProspectivePlayer !== -1) {
    readyPlayersFor6UQ.push(
      prospectivePlayersFor6UQ.splice(selectedProspectivePlayer, 1)[0],
    );
    console.log(readyPlayersFor6UQ.length);
    console.log(readyPlayersFor6UQ);
  }

  // if all players accept, start game
  if (readyPlayersFor6UQ.length === 6) {
    console.log('ready to start game');
    startQueueGame([...readyPlayersFor6UQ], 'unranked');
    readyPlayersFor6UQ = [];
    prospectivePlayersFor6UQ = [];
    console.log("UQ:");
    console.log(prospectivePlayersFor6UQ);
    console.log(readyPlayersFor6UQ);
    clearTimeout(timeout);
    if (unrankedQueue6Players.length >= 6 && prospectivePlayersFor6UQ.length == 0 && readyPlayersFor6UQ.length == 0) {
      checkForUnrankedConfirmation();
    }
  }
  return;
}

// to start game, do the following:
function startQueueGame(inGameQueue: MatchMakingQueueItem[], ranked: String) {
  // check if game has begun
  // let gameStarted = false;
  // create new room
  console.log("List of inGameQueue");
  console.log(inGameQueue);
  console.log("UQ:");
  console.log(prospectivePlayersFor6UQ);
  console.log(readyPlayersFor6UQ);
  console.log("RQ:");
  console.log(prospectivePlayersFor6RQ);
  console.log(readyPlayersFor6RQ);
  const socket = getSocketFromUsername(inGameQueue[0].username);
  const nextRoomId = newQueueRoom(socket, inGameQueue, ranked);
  console.log(
    'New room id: ' +
    nextRoomId +
    ' with host: ' +
    inGameQueue[0].username,
  );

  inGameQueue.forEach((player) => {
    console.log(player);
    const playerSocket: SocketUser = getSocketFromUsername(
      player.username.toLowerCase(),
    );
    console.log('Asking player to join: ' + playerSocket.request.user.username);
    joinQueueRoomAndSitDown(nextRoomId, playerSocket);
  });

  getHostToBeginQueueGame(nextRoomId);
}

// Create a new room for the game
function newQueueRoom(socket: SocketUser, inGameQueue: MatchMakingQueueItem[], ranked: String): number {
  const boundNewRoom = newRoom.bind(socket);
  const dataObject = {
    maxNumPlayers: 10,
    newRoomPassword: '',
    gameMode: AVALON,
    muteSpectators: false,
    disableVoteHistory: false,
    ranked: ranked,
    skipAutoJoinRoomId: true,
  };
  const nextRoomId = boundNewRoom(dataObject);

  inGameQueue.forEach((player) => {
    const playerSocket: SocketUser = getSocketFromUsername(
      player.username.toLowerCase(),
    );
    playerSocket.emit('game-has-begun');
  });

  return nextRoomId;
}

// add players to the room
function joinQueueRoomAndSitDown(roomId: number, playerSocket: SocketUser) {
  if (!rooms[roomId]) {
    console.log("Room does not exist!");
    return;
  }
  const boundJoinRoom = joinRoom.bind(playerSocket);
  boundJoinRoom(roomId, '');

  // Immediately force them to sit down.
  playerSocket.emit('change-view', roomId);
  rooms[roomId].playerSitDown(playerSocket);
  setTimeout(() => {
    rooms[roomId].distributeGameData();
  }, 500);
}

function getHostToBeginQueueGame(roomId: number) {
  const gameRoom = rooms[roomId];
  if (!gameRoom) {
    return;
  }

  gameRoom.canJoin = false;
  gameRoom.startGame(['Assassin', 'Merlin', 'Percival', 'Morgana']);
}

// Add player to queue, and start match if six players in queue
function joinRankedQueue(dataObj: { numPlayers: number; }) {
  // add player to queue

  // First if checks if player is joining the six-player game or not
  if (dataObj.numPlayers !== 6) {
    // if number of players in queue >= 6, ask for confirmation to join game
    this.emit('invalid-player-count');
    return
  } else if (
    !rankedQueue6Players.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    ) &&
    !prospectivePlayersFor6RQ.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    ) &&
    !readyPlayersFor6RQ.some(
      (player) => player.username === this.request.user.username.toLowerCase(),
    )
  ) {
    rankedQueue6Players.push({
      username: this.request.user.username.toLowerCase(),
      timeJoinedAt: Date.now(),
      playerRating: this.request.user.playerRating, // Currently using the elo, change to Chen's implementation later
    });
    rankedQueue6Players.sort((a, b) => a.playerRating - b.playerRating);
    // console.log(rankedQueue6Players.length);
    console.log('List of players:');
    console.log(rankedQueue6Players.map((player) => player.username));
    // if number of players in queue < 6, return null
    // Second if checks if there are enough players for a six-player game
    if (rankedQueue6Players.length >= 6 && prospectivePlayersFor6RQ.length == 0 && readyPlayersFor6RQ.length == 0) {
      isMatching = true
      checkForRankedConfirmation();
    } else {
      return;
    }
  } else {
    return;
  }
}

setInterval(() => {
  if (!isMatching && rankedQueue6Players.length >= 6) {
    debouncedMatch();
  }
}, 3000);

// @ts-ignore
const debouncedMatch = () => debounce(checkForRankedConfirmation(), 3000)

// Ask each player to confirm they are ready to join
function checkForRankedConfirmation() {
  console.log("start matching..")
  const matchedResult = matchMakePlayers(rankedQueue6Players);
  if (matchedResult) {
    isMatching = false
    const matchedName = matchedResult.map((player) => player.username)
    rankedQueue6Players = rankedQueue6Players.filter(
      (player) => !matchedName.includes(player.username)
    );
    prospectivePlayersFor6RQ.push(...matchedResult);
    prospectivePlayersFor6RQ.forEach(prospectivePlayer => {
      // emit to each player asking for confirmation
      const playerSocket: SocketUser = getSocketFromUsername(prospectivePlayer.username.toLowerCase());
      playerSocket.emit('confirm-ready-to-play');
    });
  }

  // setTimeout for 120 seconds; if readyPlayers.length != 6, terminate
  timeout2 = setTimeout(() => {
    if (prospectivePlayersFor6RQ.length > 0) {
      rankedQueue6Players.push(...readyPlayersFor6RQ);
      readyPlayersFor6RQ = [];
      prospectivePlayersFor6RQ = [];
    if (rankedQueue6Players.length >= 6 && prospectivePlayersFor6RQ.length == 0 && readyPlayersFor6RQ.length == 0) {
      isMatching = true
      checkForRankedConfirmation();
    }
    }
  }, 120000)
}

// remove player from queue
function leaveRankedQueue() {
  // remove player from queue
  const userName = this.request.user.username.toLowerCase();
  const indexToRemove: number = rankedQueue6Players.findIndex(player => player.username === userName);
  if (indexToRemove !== -1) {
    rankedQueue6Players.splice(indexToRemove, 1);
    this.emit('leave-queue');
  } else {
    this.emit('invalid-removal-attempt');
  }
}

function readyRankedGame(dataObj: { playerReady: any; }) {
  // if a player accepts, add them to the list of ready players
  const selectedProspectivePlayer = prospectivePlayersFor6RQ.findIndex(
    player => player.username === this.request.user.username.toLowerCase()
  )

  if (!dataObj.playerReady) {
    const decliningPlayer = this.request.user.username;
    // if a player rejects or times out, add other players to queue
    [...prospectivePlayersFor6RQ, ...readyPlayersFor6RQ].forEach((prospectivePlayer) => {
      // emit to each player informing that the player has cancelled.
      const playerSocket: SocketUser = getSocketFromUsername(
        prospectivePlayer.username.toLowerCase(),
      );
      playerSocket.emit('declined-to-play', {
        decliningPlayer,
        username: prospectivePlayer.username,
      });
    });
    prospectivePlayersFor6RQ.splice(selectedProspectivePlayer, 1);
    rankedQueue6Players = [
      ...rankedQueue6Players,
      ...prospectivePlayersFor6RQ,
      ...readyPlayersFor6RQ
    ];
    prospectivePlayersFor6RQ = [];
    readyPlayersFor6RQ = [];   
    if (rankedQueue6Players.length >= 6 && prospectivePlayersFor6RQ.length == 0 && readyPlayersFor6RQ.length == 0) {
      isMatching = true
      checkForRankedConfirmation();
    }
    rankedQueue6Players.sort((a, b) => a.playerRating - b.playerRating);    
    if (rankedQueue6Players.length >= 6 && prospectivePlayersFor6RQ.length == 0 && readyPlayersFor6RQ.length == 0) {
      isMatching = true
      checkForRankedConfirmation();
    }
  } else if (selectedProspectivePlayer === -1) {
    return;
  } else if (dataObj.playerReady && selectedProspectivePlayer !== -1) {
    readyPlayersFor6RQ.push(
      prospectivePlayersFor6RQ.splice(selectedProspectivePlayer, 1)[0],
    );
    console.log(readyPlayersFor6RQ.length);
    console.log(readyPlayersFor6RQ);
  }

  // if all players accept, start game
  if (readyPlayersFor6RQ.length === 6) {
    console.log('ready to start game');
    startQueueGame([...readyPlayersFor6RQ], 'ranked');
    readyPlayersFor6RQ = [];
    prospectivePlayersFor6RQ = [];
    console.log("RQ:");
    console.log(prospectivePlayersFor6RQ);
    console.log(readyPlayersFor6RQ);
    clearTimeout(timeout2);
    if (rankedQueue6Players.length >= 6 && prospectivePlayersFor6RQ.length == 0 && readyPlayersFor6RQ.length == 0) {
      isMatching = true
      checkForRankedConfirmation();
    }
  }
  return;
}

export { joinUnrankedQueue, leaveUnrankedQueue, readyUnrankedGame, joinRankedQueue, leaveRankedQueue, readyRankedGame }