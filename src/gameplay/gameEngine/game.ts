// @ts-nocheck
import _ from 'lodash';

import Room, { RoomConfig } from './room';
import usernamesIndexes from '../../myFunctions/usernamesIndexes';
import User from '../../models/user';
import GameRecord from '../../models/gameRecord';
import RatingPeriodGameRecord from '../../models/RatingPeriodGameRecord';
import { isMod } from '../../modsadmins/mods';
import { isTO } from '../../modsadmins/tournamentOrganizers';
import { isDev } from '../../modsadmins/developers';
import { modOrTOString } from '../../modsadmins/modOrTO';

import { RoomCreationType } from './roomTypes';
import { Phase } from './phases/types';
import {
  Alliance,
  IRecoverable,
  RecoverableComponent,
  RecoverEntry,
  RoomPlayer,
} from './types';
import { GameTimer, Timeouts } from './gameTimer';
import { VoidGameTracker } from './voidGameTracker';
import { SocketUser } from '../../sockets/types';
import { avalonRoles, rolesThatCantGuessMerlin } from './roles/roles';
import { avalonCards } from './cards/cards';
import { avalonPhases, commonPhases } from './phases/phases';
import { Card } from './cards/types';
import { Role } from './roles/types';
import { millisToStr } from '../../util/time';
import shuffleArray from '../../util/shuffleArray';
import { Anonymizer } from './anonymizer';
import { sendReplyToCommand } from '../../sockets/sockets';
import { gamesPlayedMetric } from '../../metrics/gameMetrics';

export const WAITING = 'Waiting';
export const MIN_PLAYERS = 5;

const ALLIANCES = [
  Alliance.Resistance,
  Alliance.Resistance,
  Alliance.Resistance,
  Alliance.Spy,
  Alliance.Spy,
  Alliance.Resistance,
  Alliance.Spy,
  Alliance.Resistance,
  Alliance.Resistance,
  Alliance.Spy,
];

export const NUM_PLAYERS_ON_MISSION = [
  [2, 3, 2, 3, 3],
  [2, 3, 4, 3, 4],
  [2, 3, 3, 4, 4],
  [3, 4, 4, 5, 5],
  [3, 4, 4, 5, 5],
  [3, 4, 4, 5, 5],
];

export class GameConfig {
  roomConfig: RoomConfig;
  muteSpectators = false;
  disableVoteHistory = false;
  roomCreationType: RoomCreationType;
  getTimeFunc: () => Date;

  constructor(
    roomConfig: RoomConfig,
    muteSpectators: boolean,
    disableVoteHistory: boolean,
    roomCreationType: RoomCreationType,
    getTimeFunc: () => Date,
  ) {
    this.roomConfig = roomConfig;
    this.muteSpectators = muteSpectators;
    this.disableVoteHistory = disableVoteHistory;
    this.roomCreationType = roomCreationType;
    this.getTimeFunc = getTimeFunc;
  }
}

class Game extends Room {
  gameStarted = false;
  finished = false;
  playersInGame = [];
  phase: Phase = Phase.PickingTeam;
  phaseBeforeFrozen: Phase = this.phase;
  missionHistory = [];
  teamLeader = 0;
  hammer = 0;
  missionNum = 0;
  pickNum = 0;
  roomCreationType: RoomCreationType;

  // Game misc variables
  winner: Alliance = '';
  requireSave = false;
  critMission = false; // TODO: remove this and make it a function getter that calculates this on each call.

  // TODO This shouldn't be here! Should be in Assassin file.
  startAssassinationTime: Date;

  // Used for bots to callback moves
  interval: NodeJS.Timeout;

  botSockets: any;

  // Helpers
  commonPhases: any;
  specialRoles: any;
  specialPhases: any;
  specialCards: any;

  gameTimer: GameTimer;
  dateTimerExpires: Date;

  voidGameTracker: VoidGameTracker;

  playersYetToVote: string[] = [];

  proposedTeam: string[] = [];

  anonymizer: Anonymizer = new Anonymizer();
  anonymousMode = false;

  recoverableComponents: IRecoverable[] = [];

  constructor(gameConfig: GameConfig) {
    super(gameConfig.roomConfig);

    // Expand config
    this.muteSpectators = gameConfig.muteSpectators;
    this.disableVoteHistory = gameConfig.disableVoteHistory;
    this.roomCreationType = gameConfig.roomCreationType;
    this.getTimeFunc = gameConfig.getTimeFunc;

    this.phaseBeforePause = '';
    this.playerUsernamesInGame = [];

    this.resistanceUsernames = [];
    this.spyUsernames = [];

    this.roleKeysInPlay = [];
    this.cardKeysInPlay = [];

    this.numFailsHistory = [];
    this.proposedTeam = [];
    this.lastProposedTeam = [];
    this.votes = [];

    // Only show all the votes when they've all come in, not one at a time
    this.publicVotes = [];
    this.missionVotes = [];

    this.voteHistory = {};

    // Room misc variables
    this.chatHistory = []; // Here because chatHistory records after game starts
    this.gameTimer = new GameTimer(this, gameConfig.getTimeFunc);
    this.voidGameTracker = new VoidGameTracker(this);

    this.setupRecoverableComponents();
  }

  destructor(): void {
    this.gameTimer.destructor();
  }

  configureTimeouts(timeouts: Timeouts): void {
    if (this.gameStarted === false) {
      this.gameTimer.configureTimeouts(timeouts);
    }
  }

  configureAnonymousMode(anonymousMode: boolean): void {
    if (this.gameStarted === false) {
      this.anonymousMode = anonymousMode;
    }
  }

  setupRecoverableComponents(): void {
    this.recoverableComponents = [];
    this.recoverableComponents.push(this.anonymizer);
  }

  // RECOVER GAME!
  recoverGame(storedData): void {
    // Set a few variables back to new state
    this.allSockets = [];
    this.socketsOfPlayers = [];
    this.timeFrozenLoaded = new Date();

    // Reload all objects so that their functions are also generated
    // Functions are not stored with JSONified during storage
    this.commonPhases = this.initialiseGameDependencies(commonPhases);

    this.specialRoles = this.initialiseGameDependencies(avalonRoles);
    this.specialPhases = this.initialiseGameDependencies(avalonPhases);
    this.specialCards = this.initialiseGameDependencies(avalonCards);

    this.gameTimer = new GameTimer(this, () => new Date());
    this.gameTimer.configureTimeouts(storedData.timeoutSettings);

    this.voidGameTracker = new VoidGameTracker(this);

    this.claimingPlayers = new Set();

    // Roles
    // Remove the circular dependency
    for (const key in storedData.specialRoles) {
      // eslint-disable-next-line no-prototype-builtins
      if (storedData.specialRoles.hasOwnProperty(key)) {
        delete storedData.specialRoles[key].thisRoom;
      }
    }
    // Merge in the objects
    _.merge(this.specialRoles, storedData.specialRoles);

    // Cards
    // Remove the circular dependency
    for (const key in storedData.specialCards) {
      // eslint-disable-next-line no-prototype-builtins
      if (storedData.specialCards.hasOwnProperty(key)) {
        delete storedData.specialCards[key].thisRoom;
      }
    }

    // Merge in the objects
    _.merge(this.specialCards, storedData.specialCards);

    this.phaseBeforeFrozen = this.phase;
    this.changePhase(Phase.Frozen);

    // Special Recoverable components
    const recoverableComponents: RecoverEntry[] = JSON.parse(
      storedData.recoverableComponents,
    );

    for (const { name, data } of recoverableComponents) {
      switch (name) {
        case RecoverableComponent.Anonymizer:
          this.anonymizer = new Anonymizer();
          _.merge(this.anonymizer, storedData.anonymizer);
          this.anonymizer.recover(data);
      }
    }

    this.setupRecoverableComponents();
  }

  serialise(): string {
    const data: RecoverEntry[] = [];

    for (const recoverable of this.recoverableComponents) {
      data.push({ name: recoverable.name, data: recoverable.serialise() });
    }

    return JSON.stringify(data);
  }

  playerJoinRoom(socket, inputPassword) {
    if (this.gameStarted === true) {
      // if the new socket is a player, add them to the sockets of players
      for (let i = 0; i < this.playersInGame.length; i++) {
        if (
          this.playersInGame[i].username.toLowerCase() ===
          socket.request.user.username.toLowerCase()
        ) {
          this.socketsOfPlayers.splice(i, 0, socket);

          const prevUsername = this.playersInGame[i].username;
          this.playersInGame[i].request = socket.request;
          // To fix a bug where a user would change the case of their username, someone would vote,
          // and then vote history reading would die because it's keyed by the case sensitive username.
          // Should fix this properly by extracting out VH stuff to a separate class in the future.
          this.playersInGame[i].username = prevUsername;

          break;
        }
      }

      // Checks for frozen games. Don't delete a frozen game until all players have rejoined
      if (
        this.phase === Phase.Frozen &&
        this.socketsOfPlayers.length >= this.playersInGame.length
      ) {
        this.changePhase(this.phaseBeforeFrozen);
      }

      const resultOfRoomJoin = Room.prototype.playerJoinRoom.call(
        this,
        socket,
        inputPassword,
      );

      // If the player failed the join, remove their socket.
      if (resultOfRoomJoin === false) {
        const index = this.socketsOfPlayers.indexOf(socket);
        if (index !== -1) {
          this.socketsOfPlayers.splice(index, 1);
        }
      }

      return resultOfRoomJoin;
    }

    return Room.prototype.playerJoinRoom.call(this, socket, inputPassword);
  }

  playerSitDown(socket) {
    // If the game has started
    if (this.gameStarted === true) {
      socket.emit('danger-alert', 'Game has already started.');
      return;
    }

    Room.prototype.playerSitDown.call(this, socket);
  }

  playerStandUp(socket) {
    // If the game has started
    if (this.gameStarted === true) {
      return;
    }

    Room.prototype.playerStandUp.call(this, socket);
  }

  playerLeaveRoom(socket) {
    if (this.gameStarted === true) {
      // if they exist in socketsOfPlayers, then remove them
      let index = this.socketsOfPlayers.indexOf(socket);
      if (index !== -1) {
        // console.log("Removing index " + index);
        this.socketsOfPlayers.splice(index, 1);
      }
      // Remove from all sockets as well
      index = this.allSockets.indexOf(socket);
      if (index !== -1) {
        // console.log("Removing index " + index);
        this.allSockets.splice(index, 1);
      }

      this.distributeGameData();
    }

    // If one person left in the room, the host would change
    // after the game started. So this will fix it
    let origHost;
    if (this.gameStarted === true) {
      origHost = this.host;
    }

    Room.prototype.playerLeaveRoom.call(this, socket);

    if (this.gameStarted === true) {
      this.host = origHost;
    }
  }

  static checkOptions(options: string[]): {
    success: boolean;
    errMessage: string;
  } {
    if (
      options.includes(Role.Assassin) &&
      options.includes(Role.MordredAssassin)
    ) {
      return {
        success: false,
        errMessage:
          'Cannot start a game with both Assassin and MordredAssassin',
      };
    }

    return { success: true, errMessage: '' };
  }

  // start game
  startGame(options: string[]) {
    if (
      this.socketsOfPlayers.length < 5 ||
      this.socketsOfPlayers.length > 10 ||
      this.gamePlayerLeftDuringReady === true
    ) {
      this.canJoin = true;
      this.gamePlayerLeftDuringReady = false;
      return false;
    }
    this.startGameTime = new Date();

    // make game started after the checks for game already started
    this.gameStarted = true;
    this.merlinguesses = {};

    let rolesAssignment = generateAssignmentOrders(
      this.socketsOfPlayers.length,
    );

    let shuffledPlayerAssignments = [];
    // shuffle the players around. Make sure to redistribute this room player data in sockets.
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      shuffledPlayerAssignments[i] = i;
    }
    shuffledPlayerAssignments = shuffleArray(shuffledPlayerAssignments);

    const tempSockets = [];
    // create temp sockets
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      tempSockets[i] = this.socketsOfPlayers[i];
    }

    // assign the shuffled sockets
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      this.socketsOfPlayers[i] = tempSockets[shuffledPlayerAssignments[i]];
    }

    // Now we initialise roles
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      this.playersInGame[i] = {};
      // assign them the sockets but with shuffled.
      this.playersInGame[i].username =
        this.socketsOfPlayers[i].request.user.username;
      this.playersInGame[i].userId = this.socketsOfPlayers[i].request.user.id;

      this.playersInGame[i].request = this.socketsOfPlayers[i].request;

      // set the role to be from the roles array with index of the value
      // of the rolesAssignment which has been shuffled
      this.playersInGame[i].alliance = ALLIANCES[rolesAssignment[i]];

      this.playerUsernamesInGame.push(
        this.socketsOfPlayers[i].request.user.username,
      );
    }

    this.anonymizer.initialise(this.playerUsernamesInGame, this.anonymousMode);

    // Give roles to the players according to their alliances
    // Get roles:
    this.resRoles = [];
    this.spyRoles = [];

    for (let i = 0; i < options.length; i++) {
      const op = options[i];
      // console.log(op);
      // If a role file exists for this
      if (this.specialRoles.hasOwnProperty(op)) {
        // If it is a res:
        if (this.specialRoles[op].alliance === Alliance.Resistance) {
          this.resRoles.push(this.specialRoles[op].role);
        } else if (this.specialRoles[op].alliance === Alliance.Spy) {
          this.spyRoles.push(this.specialRoles[op].role);
        } else {
          console.log(
            'THIS SHOULD NOT HAPPEN! Invalid role file. Look in game.js file.',
          );
        }
        this.roleKeysInPlay.push(op);
      }

      // If a card file exists for this
      else if (this.specialCards.hasOwnProperty(op)) {
        this.cardKeysInPlay.push(op);
      } else {
        throw new Error(
          `Warning: Client requested a role that doesn't exist -> ${op}`,
        );
      }
    }

    const resPlayers = [];
    const spyPlayers = [];

    for (let i = 0; i < this.playersInGame.length; i++) {
      if (this.playersInGame[i].alliance === Alliance.Resistance) {
        resPlayers.push(i);
        this.resistanceUsernames.push(this.playersInGame[i].username);
      } else if (this.playersInGame[i].alliance === Alliance.Spy) {
        spyPlayers.push(i);
        this.spyUsernames.push(this.playersInGame[i].username);
      }
    }

    // Assign the res roles randomly
    rolesAssignment = generateAssignmentOrders(resPlayers.length);
    for (let i = 0; i < rolesAssignment.length; i++) {
      this.playersInGame[resPlayers[i]].role =
        this.resRoles[rolesAssignment[i]];
      // console.log("res role: " + resRoles[rolesAssignment[i]]);
    }

    // Assign the spy roles randomly
    rolesAssignment = generateAssignmentOrders(spyPlayers.length);
    for (let i = 0; i < rolesAssignment.length; i++) {
      this.playersInGame[spyPlayers[i]].role =
        this.spyRoles[rolesAssignment[i]];
      // console.log("spy role: " + spyRoles[rolesAssignment[i]]);
    }

    // for those players with no role, set their role to their alliance (i.e. for Resistance VT and Spy VS)
    for (let i = 0; i < this.playersInGame.length; i++) {
      // console.log(this.playersInGame[i].role);
      if (this.playersInGame[i].role === undefined) {
        this.playersInGame[i].role = this.playersInGame[i].alliance;
        // console.log("Overwrite role as alliance for player: " + this.playersInGame[i].username);
      }
    }

    // After roles are assigned, set displayRole for deceptive roles (Melron/Moregano).
    for (const player of this.playersInGame) {
      if (player.role === Role.Melron) {
        player.displayRole = Role.Merlin;
      } else if (player.role === Role.Moregano) {
        player.displayRole = Role.Morgana;
        player.displayAlliance = Alliance.Spy;
      }
    }

    // Prepare the data for each person to see for the rest of the game.
    // The following data do not change as the game goes on.
    for (let i = 0; i < this.playersInGame.length; i++) {
      // Lowercase the role to give the file name
      const role = this.playersInGame[i].role;
      this.playersInGame[i].see = this.specialRoles[role].see();
    }

    // set game start parameters
    // get a random starting team leader
    this.teamLeader = getRandomInt(0, this.playersInGame.length);
    this.hammer =
      (this.teamLeader - 5 + 1 + this.playersInGame.length) %
      this.playersInGame.length;

    this.missionNum = 1;
    this.pickNum = 1;
    this.missionHistory = [];

    console.log(this.ranked);
    let str = '';
    if (this.ranked === true) {
      str = 'This game is ranked.';
    } else {
      str = 'This game is unranked.';
    }
    this.sendText(str, 'gameplay-text');

    str = 'Game started with: ';
    for (let i = 0; i < this.roleKeysInPlay.length; i++) {
      str += `${this.specialRoles[this.roleKeysInPlay[i]].role}, `;
    }
    for (let i = 0; i < this.cardKeysInPlay.length; i++) {
      str += `${this.specialCards[this.cardKeysInPlay[i]].card}, `;
    }

    // remove the last , and replace with .
    str = str.slice(0, str.length - 2);
    str += '.';
    this.sendText(str, 'gameplay-text');

    const timeouts = this.gameTimer.getTimeouts();
    if (timeouts.assassination || timeouts.default || timeouts.critMission) {
      this.sendText(
        `Timeouts: Default = ${millisToStr(
          timeouts.default,
        )}, Critical Mission = ${millisToStr(
          timeouts.critMission,
        )}, Assassination = ${millisToStr(timeouts.assassination)}`,
        'gameplay-text',
      );
    }

    if (this.muteSpectators) {
      this.sendText('The game is muted to spectators.', 'gameplay-text');
    }

    if (this.disableVoteHistory) {
      this.sendText('The game has vote history disabled.', 'gameplay-text');
    }

    if (this.anonymousMode) {
      this.sendText('The game is running in anonymous mode.', 'gameplay-text');

      if (this.roomCreationType === RoomCreationType.CUSTOM_ROOM) {
        str = 'Current players in game: ';
        for (let i = 0; i < this.socketsOfPlayers.length; i++) {
          str += `${this.socketsOfPlayers[i].request.user.username}, `;
        }

        // remove the last , and replace with .
        str = str.slice(0, str.length - 2);
        str += '.';
        this.sendText(str, 'gameplay-text');
      }
    }

    // seed the starting data into the VH
    for (let i = 0; i < this.playersInGame.length; i++) {
      this.voteHistory[this.playersInGame[i].request.user.username] = [];
    }

    // Initialise all the Cards
    for (let i = 0; i < this.cardKeysInPlay.length; i++) {
      this.specialCards[this.cardKeysInPlay[i]].initialise();
    }

    this.distributeGameData();

    this.botIndexes = [];
    for (let i = 0; i < this.socketsOfPlayers.length; i++) {
      if (this.socketsOfPlayers[i].isBotSocket === true) {
        this.botIndexes.push(i);
      }
    }

    const thisGame = this;
    const pendingBots = [];
    this.socketsOfPlayers
      .filter((socket) => socket.isBotSocket)
      .forEach((botSocket) => {
        pendingBots.push(botSocket);
        botSocket.handleGameStart(thisGame, (success, reason) => {
          if (success) {
            pendingBots.splice(pendingBots.indexOf(botSocket), 1);
          } else {
            let message = `${botSocket.request.user.username} failed to initialize and has left the game.`;
            if (reason) {
              message += ` Reason: ${reason}`;
            }
            thisGame.sendText(message, 'server-text-teal');
            thisGame.playerLeaveRoom(botSocket);
          }
        });
      });

    this.checkBotMoves(pendingBots);

    return true;
  }

  checkBotMoves(pendingBots) {
    if (this.botIndexes.length === 0) {
      return;
    }

    const timeEachLoop = 1000;

    const thisRoom = this;

    // Players whose moves we're waiting for
    this.interval = setInterval(() => {
      // hack: check for hammer reject
      if (thisRoom.howWasWon === 'Hammer rejected.') {
        thisRoom.finished = true;
      }

      if (thisRoom.finished === true) {
        clearInterval(thisRoom.interval);
        thisRoom.interval = undefined;
      }

      thisRoom.botSockets.forEach((botSocket) => {
        const botIndex = thisRoom.socketsOfPlayers.indexOf(botSocket);
        if (botIndex === -1) {
          return;
        }

        const buttons = thisRoom.getClientButtonSettings(botIndex);
        const numOfTargets = thisRoom.getClientNumOfTargets(botIndex);
        const prohibitedIndexesToPick =
          thisRoom.getProhibitedIndexesToPick(botIndex) || [];

        const availableButtons = [];
        if (buttons.green.hidden !== true) {
          availableButtons.push('yes');
        }
        const seatIndex = usernamesIndexes.getIndexFromUsername(
          thisRoom.playersInGame,
          botSocket.request.user.username,
        );
        const onMissionAndResistance =
          thisRoom.phase == Phase.VotingMission &&
          thisRoom.playersInGame[seatIndex].alliance === Alliance.Resistance;
        // Add a special case so resistance bots can't fail missions.
        if (buttons.red.hidden !== true && onMissionAndResistance === false) {
          availableButtons.push('no');
        }

        // Skip bots we don't need moves from.
        if (availableButtons.length == 0) {
          return;
        }

        // Skip bots whose moves are pending. (We're waiting for them to respond).
        if (pendingBots.indexOf(botSocket) !== -1) {
          return;
        }

        pendingBots.push(botSocket);

        let availablePlayers = thisRoom.playersInGame
          .filter(
            (player, playerIndex) =>
              prohibitedIndexesToPick.indexOf(playerIndex) === -1,
          )
          .map((player) => player.request.user.username);

        // If there are 0 number of targets, there are no available players.
        if (numOfTargets === null) {
          availablePlayers = [];
        }

        botSocket.handleRequestAction(
          thisRoom,
          availableButtons,
          availablePlayers,
          numOfTargets,
          (move, reason) => {
            // Check for move failure.
            if (move === false) {
              let message = `${botSocket.request.user.username} failed to make a move and has left the game.`;
              if (reason) {
                message += ` Reason: ${reason}`;
              }
              thisRoom.sendText(message, 'server-text-teal');
              thisRoom.playerLeaveRoom(botSocket);
              return;
            }

            // Check for move validity.
            const pressedValidButton =
              availableButtons.indexOf(move.buttonPressed) !== -1;
            const selectedValidPlayers =
              numOfTargets === 0 ||
              numOfTargets === null ||
              (move.selectedPlayers &&
                (numOfTargets === move.selectedPlayers.length ||
                  numOfTargets.includes(move.selectedPlayers.length)) &&
                move.selectedPlayers.every(
                  (player) => availablePlayers.indexOf(player) !== -1,
                ));

            if (!pressedValidButton || !selectedValidPlayers) {
              const message = `${
                botSocket.request.user.username
              } made an illegal move and has left the game. Move: ${JSON.stringify(
                move,
              )}`;
              thisRoom.sendText(message, 'server-text-teal');
              thisRoom.playerLeaveRoom(botSocket);
              return;
            }

            pendingBots.splice(pendingBots.indexOf(botSocket), 1);

            //! Note: the inputs into gameMove() here are legacy inputs. New bots should conform to the new inputs expected by gameMove.
            // Make the move
            if (numOfTargets == 0 || numOfTargets == null) {
              thisRoom.gameMove(botSocket, [move.buttonPressed, []]);
            } else {
              thisRoom.gameMove(botSocket, ['yes', move.selectedPlayers]);
            }
          },
        );
      });
    }, timeEachLoop);
  }

  gameMove(socket, data) {
    if (data.length !== 2) {
      return;
    }

    const buttonPressed = data[0];
    let selectedPlayers = data[1];

    if (selectedPlayers === undefined || selectedPlayers === null) {
      selectedPlayers = [];
    }
    selectedPlayers = this.anonymizer.deAnonMany(selectedPlayers);

    // console.log(buttonPressed, selectedPlayers);

    // Common phases
    if (
      this.commonPhases.hasOwnProperty(this.phase) === true &&
      this.commonPhases[this.phase].gameMove
    ) {
      this.commonPhases[this.phase].gameMove(
        socket,
        buttonPressed,
        selectedPlayers,
      );
    }

    // Special phases
    else if (
      this.specialPhases.hasOwnProperty(this.phase) === true &&
      this.specialPhases[this.phase].gameMove
    ) {
      this.specialPhases[this.phase].gameMove(
        socket,
        buttonPressed,
        selectedPlayers,
      );
    }

    // THIS SHOULDN'T HAPPEN!! We always require a gameMove function to change phases
    else {
      this.sendText(
        'ERROR LET ADMIN KNOW IF YOU SEE THIS code 1',
        'gameplay-text',
      );
    }

    // RUN SPECIAL ROLE AND CARD CHECKS
    this.checkRoleCardSpecialMoves(socket, buttonPressed, selectedPlayers);

    this.distributeGameData();
  }

  changePhase(phase: Phase) {
    this.phase = phase;

    this.dateTimerExpires = this.gameTimer.restartTimer();
  }

  toShowGuns() {
    // Common phases
    if (
      // eslint-disable-next-line no-prototype-builtins
      this.commonPhases.hasOwnProperty(this.phase) === true &&
      this.commonPhases[this.phase].showGuns
    ) {
      return this.commonPhases[this.phase].showGuns;
    }

    // Special phases
    if (
      // eslint-disable-next-line no-prototype-builtins
      this.specialPhases.hasOwnProperty(this.phase) === true &&
      this.specialPhases[this.phase].showGuns
    ) {
      this.specialPhases[this.phase].showGuns;
    } else {
      return false;
    }
  }

  getClientNumOfTargets(indexOfPlayer) {
    // Common phases
    if (
      this.commonPhases.hasOwnProperty(this.phase) === true &&
      this.commonPhases[this.phase].numOfTargets
    ) {
      return this.commonPhases[this.phase].numOfTargets(indexOfPlayer);
    }

    // Special phases
    if (
      this.specialPhases.hasOwnProperty(this.phase) === true &&
      this.specialPhases[this.phase].numOfTargets
    ) {
      return this.specialPhases[this.phase].numOfTargets(indexOfPlayer);
    }

    return 0;
  }

  getClientButtonSettings(indexOfPlayer) {
    if (indexOfPlayer !== undefined) {
      // Common phases
      if (
        this.commonPhases.hasOwnProperty(this.phase) === true &&
        this.commonPhases[this.phase].buttonSettings
      ) {
        return this.commonPhases[this.phase].buttonSettings(indexOfPlayer);
      }

      // Special phases
      if (
        this.specialPhases.hasOwnProperty(this.phase) === true &&
        this.specialPhases[this.phase].buttonSettings
      ) {
        return this.specialPhases[this.phase].buttonSettings(indexOfPlayer);
      }

      // Spectator data
      let obj = {
        green: {},
        red: {},
      };

      obj.green.hidden = true;
      obj.green.disabled = true;
      obj.green.setText = '';

      obj.red.hidden = true;
      obj.red.disabled = true;
      obj.red.setText = '';

      return obj;
    }
    // User is a spectator

    let obj = {
      green: {},
      red: {},
    };

    obj.green.hidden = true;
    obj.green.disabled = true;
    obj.green.setText = '';

    obj.red.hidden = true;
    obj.red.disabled = true;
    obj.red.setText = '';

    return obj;
  }

  getStatusMessage(indexOfPlayer) {
    // Common phases
    if (
      this.commonPhases.hasOwnProperty(this.phase) === true &&
      this.commonPhases[this.phase].getStatusMessage
    ) {
      return this.commonPhases[this.phase].getStatusMessage(indexOfPlayer);
    }

    // Special phases
    if (
      this.specialPhases.hasOwnProperty(this.phase) === true &&
      this.specialPhases[this.phase].getStatusMessage
    ) {
      return this.specialPhases[this.phase].getStatusMessage(indexOfPlayer);
    }

    return 'There is no status message for the current phase... Let admin know if you see this code 5.';
  }

  getProhibitedIndexesToPick(indexOfPlayer) {
    // Common phases
    if (
      this.commonPhases.hasOwnProperty(this.phase) === true &&
      this.commonPhases[this.phase].getProhibitedIndexesToPick
    ) {
      return this.commonPhases[this.phase].getProhibitedIndexesToPick(
        indexOfPlayer,
      );
    }

    // Special phases
    if (
      this.specialPhases.hasOwnProperty(this.phase) === true &&
      this.specialPhases[this.phase].getProhibitedIndexesToPick
    ) {
      return this.specialPhases[this.phase].getProhibitedIndexesToPick(
        indexOfPlayer,
      );
    }

    return undefined;
  }

  incrementTeamLeader() {
    // move to next team Leader, and reset it back to the start if
    // we go into negative numbers
    this.teamLeader--;
    if (this.teamLeader < 0) {
      this.teamLeader = this.playersInGame.length - 1;
    }
    this.pickNum++;
  }

  getRoomPlayers(): RoomPlayer[] {
    if (this.gameStarted === true) {
      const roomPlayers = [];

      for (let i = 0; i < this.playersInGame.length; i++) {
        const isClaiming = this.claimingPlayers.has(
          this.playersInGame[i].request.user.username,
        );

        roomPlayers[i] = {
          username: this.anonymizer.anon(this.playersInGame[i].username),
          anonUsername: this.anonymizer.anon(
            this.playersInGame[i].username,
            false,
          ),

          avatarImgRes: this.anonymousMode
            ? null
            : this.playersInGame[i].request.user.avatarImgRes,
          avatarImgSpy: this.anonymousMode
            ? null
            : this.playersInGame[i].request.user.avatarImgSpy,
          avatarHide: this.anonymousMode
            ? null
            : this.playersInGame[i].request.user.avatarHide,
          claim: isClaiming,
        };

        // give the host the teamLeader star
        if (roomPlayers[i].username === this.host) {
          roomPlayers[i].teamLeader = true;
        }
      }
      return roomPlayers;
    }

    return Room.prototype.getRoomPlayers.call(this);
  }

  distributeGameData() {
    // distribute roles to each player
    this.updateRoomPlayers();

    if (this.gameStarted === true) {
      const gameData = this.getGameData();
      for (let i = 0; i < this.playersInGame.length; i++) {
        const index = usernamesIndexes.getIndexFromUsername(
          this.socketsOfPlayers,
          this.playersInGame[i].username,
        );
        // need to go through all sockets, but only send to the socket of players in game
        if (this.socketsOfPlayers[index]) {
          this.socketsOfPlayers[index].emit('game-data', gameData[i]);
          // console.log("Sent to player: " + this.playersInGame[i].request.user.username + " role " + gameData[i].role);
        }
      }

      const gameDataForSpectators = this.getGameDataForSpectators();

      const sockOfSpecs = this.getSocketsOfSpectators();
      sockOfSpecs.forEach((sock) => {
        sock.emit('game-data', gameDataForSpectators);
        // console.log("(for loop) Sent to spectator: " + sock.request.user.username);
      });
    }
  }

  getGameData() {
    if (this.gameStarted == true) {
      const data = {};
      const playerRoles = this.playersInGame;

      // set up the object first, because we cannot pass an array through
      // socket.io
      for (let i = 0; i < playerRoles.length; i++) {
        // Player specific data
        const effectiveAlliance = playerRoles[i].displayAlliance
          ? playerRoles[i].displayAlliance
          : playerRoles[i].alliance;

        const effectiveRole = playerRoles[i].displayRole
          ? playerRoles[i].displayRole
          : playerRoles[i].role;

        data[i] = {
          alliance: effectiveAlliance,
          role: effectiveRole,
          see: this.specialRoles[playerRoles[i].role].see(),
          username: this.anonymizer.anon(playerRoles[i].username),
        };

        // add on these common variables:
        data[i].buttons = this.getClientButtonSettings(i);

        data[i].statusMessage = this.getStatusMessage(i);

        data[i].missionNum = this.missionNum;
        data[i].missionHistory = this.missionHistory;
        data[i].numFailsHistory = this.numFailsHistory;
        data[i].pickNum = this.pickNum;
        data[i].teamLeader = this.teamLeader;
        data[i].teamLeaderReversed = gameReverseIndex(
          this.teamLeader,
          this.playersInGame.length,
        );
        data[i].hammer = this.hammer;

        data[i].playersYetToVote = this.anonymizer.anonMany(
          this.playersYetToVote,
        );
        data[i].phase = this.phase;
        data[i].proposedTeam = this.anonymizer.anonMany(this.proposedTeam);

        data[i].numPlayersOnMission =
          NUM_PLAYERS_ON_MISSION[playerRoles.length - MIN_PLAYERS]; // - 5
        data[i].numSelectTargets = this.getClientNumOfTargets(i);

        data[i].votes = this.publicVotes;
        data[i].voteHistory = this.disableVoteHistory
          ? null
          : this.anonVoteHistory();
        data[i].hammer = this.hammer;
        data[i].hammerReversed = gameReverseIndex(
          this.hammer,
          this.playersInGame.length,
        );
        data[i].winner = this.winner;

        data[i].playerUsernamesOrdered = this.anonymizer.anonMany(
          getUsernamesOfPlayersInGame(this),
        );
        data[i].playerUsernamesOrderedReversed = gameReverseArray(
          this.anonymizer.anonMany(getUsernamesOfPlayersInGame(this)),
        );

        data[i].gameplayMessage = this.gameplayMessage;

        data[i].spectator = false;
        data[i].gamePlayersInRoom = this.anonymizer.anonMany(
          getUsernamesOfPlayersInRoom(this),
        );

        data[i].roomId = this.roomId;
        data[i].toShowGuns = this.toShowGuns();

        data[i].publicData = this.getRoleCardPublicGameData();
        data[i].prohibitedIndexesToPicks = this.getProhibitedIndexesToPick(i);
        data[i].dateTimerExpires = this.dateTimerExpires;

        // if game is finished, reveal everything including roles
        if (this.phase === Phase.Finished) {
          data[i].see = {};
          data[i].see.spies = getAllSpies(this);
          data[i].see.roles = getRevealedRoles(this);
          data[i].proposedTeam = this.anonymizer.anonMany(
            this.lastProposedTeam,
          );
        } else if (this.phase === Phase.Assassination) {
          data[i].proposedTeam = this.anonymizer.anonMany(
            this.lastProposedTeam,
          );
        }
      }
      return data;
    }

    return "Game hasn't started";
  }

  getGameDataForSpectators() {
    // return false;
    const playerRoles = this.playersInGame;

    // set up the spectator data object
    const data = {};

    data.see = {};
    data.see.spies = [];
    data.see.merlins = [];

    data.buttons = this.getClientButtonSettings();

    data.statusMessage = this.getStatusMessage(-1);
    data.missionNum = this.missionNum;
    data.missionHistory = this.missionHistory;
    data.numFailsHistory = this.numFailsHistory;
    data.pickNum = this.pickNum;
    data.teamLeader = this.teamLeader;
    data.teamLeaderReversed = gameReverseIndex(
      this.teamLeader,
      this.playersInGame.length,
    );
    data.hammer = this.hammer;

    data.playersYetToVote = this.anonymizer.anonMany(this.playersYetToVote);
    data.phase = this.phase;
    data.proposedTeam = this.anonymizer.anonMany(this.proposedTeam);

    data.numPlayersOnMission =
      NUM_PLAYERS_ON_MISSION[playerRoles.length - MIN_PLAYERS]; // - 5
    data.numSelectTargets = this.getClientNumOfTargets();

    data.votes = this.publicVotes;
    data.voteHistory = this.disableVoteHistory ? null : this.anonVoteHistory();
    data.hammer = this.hammer;
    data.hammerReversed = gameReverseIndex(
      this.hammer,
      this.playersInGame.length,
    );
    data.winner = this.winner;

    data.playerUsernamesOrdered = this.anonymizer.anonMany(
      getUsernamesOfPlayersInGame(this),
    );
    data.playerUsernamesOrderedReversed = gameReverseArray(
      this.anonymizer.anonMany(getUsernamesOfPlayersInGame(this)),
    );

    data.gameplayMessage = this.gameplayMessage;

    data.spectator = true;
    data.gamePlayersInRoom = this.anonymizer.anonMany(
      getUsernamesOfPlayersInRoom(this),
    );

    data.roomId = this.roomId;
    data.toShowGuns = this.toShowGuns();
    data.dateTimerExpires = this.dateTimerExpires;

    data.publicData = this.getRoleCardPublicGameData();

    // if game is finished, reveal everything including roles
    if (this.phase === Phase.Finished) {
      data.see = {};
      data.see.spies = getAllSpies(this);
      data.see.roles = getRevealedRoles(this);
      data.proposedTeam = this.anonymizer.anonMany(this.lastProposedTeam);
    } else if (this.phase === Phase.Assassination) {
      data.proposedTeam = this.anonymizer.anonMany(this.lastProposedTeam);
    }

    return data;
  }

  // Misc game room functions
  addToChatHistory(data) {
    if (this.gameStarted === true) {
      this.chatHistory.push(data);
    }
  }

  getStatus() {
    if (this.finished === true) {
      return Phase.Finished;
    }
    if (this.phase === Phase.Frozen) {
      return 'Frozen';
    }
    if (this.phase === Phase.Paused) {
      return 'Paused';
    }
    if (this.phase === Phase.Voided) {
      return 'Voided';
    }
    if (this.gameStarted === true) {
      return 'Game in progress';
    }

    return WAITING;
  }

  finishGame(toBeWinner: Alliance) {
    const timeStarted = new Date(this.startGameTime);
    const timeFinished = new Date();
    const gameDuration = new Date(timeFinished - timeStarted);

    const playersInGameVar = this.playersInGame;

    const winnerVar = this.winner;
    if (winnerVar !== Alliance.Resistance && winnerVar !== Alliance.Spy)
      throw new Error('Winner var is not Resistance or Spy');

    const thisGame = this;
    this.changePhase(Phase.Finished);

    if (this.checkRoleCardSpecialMoves() === true) {
      return;
    }

    // If after the special card/role check the phase is
    // not finished now, then don't run the rest of the code below
    if (this.phase !== Phase.Finished) {
      return;
    }

    // From this point on, no more game moves can be made. Game is finished.
    gamesPlayedMetric.inc(1, { status: 'finished' });

    // Clean up from here.
    for (let i = 0; i < this.allSockets.length; i++) {
      this.allSockets[i].emit('gameEnded');
    }

    this.anonymizer.setGameFinished();

    this.finished = true;
    this.winner = toBeWinner;

    if (this.winner === Alliance.Spy) {
      this.sendText('The spies win!', 'gameplay-text-red');
    } else if (this.winner === Alliance.Resistance) {
      this.sendText('The resistance wins!', 'gameplay-text-blue');
    }

    // Now announce Melron / Moregano illusions
    this.announceIllusionsIfAny();

    // Post results of Merlin guesses
    if (this.resRoles.indexOf(Role.Merlin) !== -1) {
      const guessesByTarget = reverseMapFromMap(this.merlinguesses);

      const incorrectGuessersText = [];
      const usernameOfMerlin = this.playersInGame.find(
        (player) => player.role === Role.Merlin,
      ).username;
      for (const target in guessesByTarget) {
        if (guessesByTarget.hasOwnProperty(target)) {
          if (target === usernameOfMerlin) {
            this.sendText(
              `Correct Merlin guessers were: ${guessesByTarget[target].join(
                ', ',
              )}`,
              'server-text',
            );
          } else {
            incorrectGuessersText.push(
              `${guessesByTarget[target].join(', ')} (->${target})`,
            );
          }
        }
      }
      if (incorrectGuessersText.length > 0) {
        this.sendText(
          `Incorrect Merlin guessers were: ${incorrectGuessersText.join('; ')}`,
          'server-text',
        );
      }
    }

    // Reset votes
    this.votes = [];
    this.publicVotes = [];

    this.distributeGameData();

    // If there was a bot in the game and this is the online server, do not store into the database.

    // store data into the database:
    const rolesCombined = [];

    // combine roles
    for (let i = 0; i < this.resRoles.length + this.spyRoles.length; i++) {
      if (i < this.resRoles.length) {
        rolesCombined[i] = this.resRoles[i];
      } else {
        rolesCombined[i] = this.spyRoles[i - this.resRoles.length];
      }
    }

    const playerRolesVar = {};

    for (let i = 0; i < this.playersInGame.length; i++) {
      playerRolesVar[this.playersInGame[i].username] = {
        alliance: this.playersInGame[i].alliance,
        role: this.playersInGame[i].role,
      };
    }

    let ladyChain;
    let ladyHistoryUsernames;
    if (this.specialCards && this.specialCards[Card.LadyOfTheLake]) {
      ladyChain = this.specialCards[Card.LadyOfTheLake].ladyChain;
      ladyHistoryUsernames =
        this.specialCards[Card.LadyOfTheLake].ladyHistoryUsernames;
    }

    let refChain;
    let refHistoryUsernames;
    if (this.specialCards && this.specialCards['ref of the rain']) {
      refChain = this.specialCards['ref of the rain'].refChain;
      refHistoryUsernames =
        this.specialCards['ref of the rain'].refHistoryUsernames;
    }

    let sireChain;
    let sireHistoryUsernames;
    if (this.specialCards && this.specialCards['sire of the sea']) {
      sireChain = this.specialCards['sire of the sea'].sireChain;
      sireHistoryUsernames =
        this.specialCards['sire of the sea'].sireHistoryUsernames;
    }

    // console.log(this.gameMode);
    let botUsernames;
    if (this.botSockets !== undefined) {
      botUsernames = this.botSockets.map(
        (botSocket) => botSocket.request.user.username,
      );
    } else {
      botUsernames = [];
    }

    let melronSpiesSeen: string[] = [];
    const melronRole = this.specialRoles[Role.Melron];
    if (melronRole) {
      melronSpiesSeen = melronRole.getPublicGameData().spiesMelronSaw;
    }

    let moreganoSpiesSeen: string[] = [];
    const moreganoRole = this.specialRoles[Role.Moregano];
    if (moreganoRole) {
      moreganoSpiesSeen = moreganoRole.getPublicGameData().spiesMoreganoSaw;
    }

    // This data is for future records only
    const objectToStore = {
      timeGameStarted: this.startGameTime,
      timeAssassinationStarted: this.startAssassinationTime,
      timeGameFinished: timeFinished,
      winningTeam: this.winner,
      spyTeam: this.spyUsernames,
      resistanceTeam: this.resistanceUsernames,
      ranked: this.ranked,
      numberOfPlayers: this.playersInGame.length,
      gameMode: this.gameMode,
      roomCreationType: this.roomCreationType,
      anonymousMode: this.anonymousMode,
      botUsernames,

      playerUsernamesOrdered: getUsernamesOfPlayersInGame(this),
      playerUsernamesOrderedReversed: gameReverseArray(
        getUsernamesOfPlayersInGame(this),
      ),

      howTheGameWasWon: this.howWasWon,

      roles: rolesCombined,
      cards: this.cardKeysInPlay,

      missionHistory: this.missionHistory,
      numFailsHistory: this.numFailsHistory,
      voteHistory: this.voteHistory,
      disableVoteHistory: this.disableVoteHistory,
      playerRoles: playerRolesVar,

      ladyChain,
      ladyHistoryUsernames,

      refChain,
      refHistoryUsernames,

      sireChain,
      sireHistoryUsernames,

      whoAssassinShot: this.whoAssassinShot,
      whoAssassinShot2: this.whoAssassinShot2,

      melronSpiesSeen,
      moreganoSpiesSeen,
    };

    GameRecord.create(objectToStore, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Stored game data successfully.');
      }
    });

    //FR2 - Rating system 1 - record games for rating updates
    // This data will be used to calculate ratings at end of rating period.
    // The intended workflow is games -> ratingPeriodGameRecord -> (at end of rating preiod) Ratings Calculator

    if (
      this.spyUsernames.length + this.resistanceUsernames.length !=
      this.playersInGame.length
    ) {
      throw Error(
        "Spy + Resistance player nums don't add up to playersInGame length.",
      );
    }

    if (this.ranked) {
      const ratingRecordToStore = {
        timeGameFinished: timeFinished,
        winningTeam: this.winner,
        spyTeam: this.spyUsernames,
        resistanceTeam: this.resistanceUsernames,
        roomCreationType: this.roomCreationType,
      };

      RatingPeriodGameRecord.create(ratingRecordToStore, (err) => {
        if (err) {
          throw err;
        }
      });
    }

    this.socketsOfPlayers
      .filter((socket) => socket.isBotSocket)
      .forEach((botSocket) => {
        botSocket.handleGameOver(thisGame, 'complete', (shouldLeave) => {
          if (shouldLeave) {
            thisGame.playerLeaveRoom(botSocket);
          }
        });
      });

    if (botUsernames.length === 0) {
      // Check if the game contains any provisional players.
      let provisionalGame = false;
      if (
        this.playersInGame.filter(
          (soc) => soc.request.user.ratingBracket === 'unranked',
        ).length > 0
      ) {
        provisionalGame = true;
      }

      // calculate team 1v1 elo adjustment
      const teamResChange = this.calculateResistanceRatingChange(
        this.winner,
        provisionalGame,
      );
      const teamSpyChange = -teamResChange;

      // individual changes per player, to one decimal place.
      const indResChange =
        Math.round((teamResChange / this.resistanceUsernames.length) * 10) / 10;
      const indSpyChange =
        Math.round((teamSpyChange / this.spyUsernames.length) * 10) / 10;

      // if we're in a ranked game show the elo adjustments
      if (this.ranked) {
        // Get the old player ratings (with usernames) for use in provisional calculations.
        const oldPlayersInfo = this.playersInGame.map((soc) => {
          const data = {};
          data.username = soc.request.user.username;
          data.rating = soc.request.user.playerRating;
          return data;
        });

        // Broadcast elo adjustments in chat first, if broadcasted in the updating process, its slow
        this.sendText('Rating Adjustments:', 'server-text');
        this.playersInGame.forEach((player) => {
          const rating = player.request.user.playerRating;
          // If player is provisional, different adjustment.
          if (player.request.user.ratingBracket === 'unranked') {
            // Ensure this value is changed in time for the callbacks, requires a refresh to get the actual db value.
            player.request.user.totalRankedGamesPlayed += 1;

            // If there are multiple provisional players, use all ratings, otherwise just the other players' ratings.
            if (
              this.playersInGame.filter(
                (soc) => soc.request.user.ratingBracket === 'unranked',
              ).length > 1
            ) {
              const playerRatings = oldPlayersInfo.map((data) => data.rating);
              player.request.user.playerRating =
                this.calculateNewProvisionalRating(
                  this.winner,
                  player,
                  playerRatings,
                );
            } else {
              const otherPlayerRatings = oldPlayersInfo
                .filter(
                  (data) => !(data.username === player.request.user.username),
                )
                .map((data) => data.rating);
              player.request.user.playerRating =
                this.calculateNewProvisionalRating(
                  this.winner,
                  player,
                  otherPlayerRatings,
                );
            }
            const difference =
              Math.round((player.request.user.playerRating - rating) * 10) / 10;
            this.sendText(
              `${player.request.user.username}: ${Math.floor(
                rating,
              )} -> ${Math.floor(player.request.user.playerRating)} (${
                difference > 0 ? '+' + difference : difference
              })`,
              'server-text',
            );
          } else {
            if (player.alliance === Alliance.Resistance) {
              this.sendText(
                `${player.request.user.username}: ${Math.floor(
                  rating,
                )} -> ${Math.floor(rating + indResChange)} (${
                  indResChange > 0 ? '+' + indResChange : indResChange
                })`,
                'server-text',
              );
              player.request.user.playerRating += indResChange;
            } else if (player.alliance === Alliance.Spy) {
              this.sendText(
                `${player.request.user.username}: ${Math.floor(
                  rating,
                )} -> ${Math.floor(rating + indSpyChange)} (${
                  indSpyChange > 0 ? '+' + indSpyChange : indSpyChange
                })`,
                'server-text',
              );
              player.request.user.playerRating += indSpyChange;
            }
          }
        });
      }

      if (process.env.NODE_ENV !== 'test') {
        this.playersInGame.forEach((player) => {
          User.findById(player.userId)
            .populate('notifications')
            .exec((err, foundUser) => {
              if (err) {
                console.log(err);
              } else if (foundUser) {
                foundUser.totalTimePlayed = new Date(
                  foundUser.totalTimePlayed.getTime() + gameDuration.getTime(),
                );

                // update individual player statistics
                foundUser.totalGamesPlayed += 1;

                if (winnerVar === player.alliance) {
                  foundUser.totalWins += 1;
                  if (winnerVar === Alliance.Resistance) {
                    foundUser.totalResWins += 1;
                  }
                } else {
                  // loss
                  foundUser.totalLosses += 1;
                  if (winnerVar === Alliance.Spy) {
                    foundUser.totalResLosses += 1;
                  }
                }

                // if ranked, update player ratings and increase ranked games played
                if (this.ranked) {
                  foundUser.totalRankedGamesPlayed += 1;

                  if (foundUser.ratingBracket === 'unranked') {
                    foundUser.playerRating = player.request.user.playerRating;
                  } else {
                    if (player.alliance === Alliance.Resistance) {
                      foundUser.playerRating += indResChange;
                    } else if (player.alliance === Alliance.Spy) {
                      foundUser.playerRating += indSpyChange;
                    }
                  }
                }

                // checks that the var exists
                if (
                  !foundUser.winsLossesGameSizeBreakdown[
                    `${playersInGameVar.length}p`
                  ]
                ) {
                  foundUser.winsLossesGameSizeBreakdown[
                    `${playersInGameVar.length}p`
                  ] = {
                    wins: 0,
                    losses: 0,
                  };
                }

                if (!foundUser.roleStats[`${playersInGameVar.length}p`]) {
                  foundUser.roleStats[`${playersInGameVar.length}p`] = {};
                }
                if (
                  !foundUser.roleStats[`${playersInGameVar.length}p`][
                    player.role.toLowerCase()
                  ]
                ) {
                  foundUser.roleStats[`${playersInGameVar.length}p`][
                    player.role.toLowerCase()
                  ] = {
                    wins: 0,
                    losses: 0,
                  };
                }

                if (winnerVar === player.alliance) {
                  // checks
                  if (
                    isNaN(
                      foundUser.winsLossesGameSizeBreakdown[
                        `${playersInGameVar.length}p`
                      ].losses,
                    )
                  ) {
                    foundUser.winsLossesGameSizeBreakdown[
                      `${playersInGameVar.length}p`
                    ].wins = 0;
                  }
                  if (
                    isNaN(
                      foundUser.roleStats[`${playersInGameVar.length}p`][
                        player.role.toLowerCase()
                      ].wins,
                    )
                  ) {
                    foundUser.roleStats[`${playersInGameVar.length}p`][
                      player.role.toLowerCase()
                    ].wins = 0;
                  }
                  // console.log("=NaN?");
                  // console.log(isNaN(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()].wins));

                  foundUser.winsLossesGameSizeBreakdown[
                    `${playersInGameVar.length}p`
                  ].wins += 1;
                  foundUser.roleStats[`${playersInGameVar.length}p`][
                    player.role.toLowerCase()
                  ].wins += 1;
                } else {
                  // checks
                  if (
                    isNaN(
                      foundUser.winsLossesGameSizeBreakdown[
                        `${playersInGameVar.length}p`
                      ].losses,
                    )
                  ) {
                    foundUser.winsLossesGameSizeBreakdown[
                      `${playersInGameVar.length}p`
                    ].losses = 0;
                  }
                  if (
                    isNaN(
                      foundUser.roleStats[`${playersInGameVar.length}p`][
                        player.role.toLowerCase()
                      ].losses,
                    )
                  ) {
                    foundUser.roleStats[`${playersInGameVar.length}p`][
                      player.role.toLowerCase()
                    ].losses = 0;
                  }

                  foundUser.winsLossesGameSizeBreakdown[
                    `${playersInGameVar.length}p`
                  ].losses += 1;
                  foundUser.roleStats[`${playersInGameVar.length}p`][
                    player.role.toLowerCase()
                  ].losses += 1;
                }
                // console.log("Rolestat for player");
                // console.log(foundUser.roleStats[playersInGameVar.length + "p"][player.role.toLowerCase()]);

                foundUser.markModified('winsLossesGameSizeBreakdown');
                foundUser.markModified('roleStats');

                foundUser.save();
                // console.log("SAVE SAVE");
              }
            });
        });
      }
    }
  }

  calcMissionVotes(votes) {
    let requiresTwoFails = false;
    if (this.playersInGame.length >= 7 && this.missionNum === 4) {
      requiresTwoFails = true;
    }

    // note we may not have all the votes from every person
    // e.g. may look like "fail", "undef.", "success"
    const numOfPlayers = votes.length;

    let countFail = 0;
    let outcome;

    for (let i = 0; i < numOfPlayers; i++) {
      if (votes[i] === 'succeed') {
        // console.log("succeed");
      } else if (votes[i] === 'fail') {
        // console.log("fail");
        countFail++;
      } else {
        // console.log("Bad vote: " + votes[i]);
      }
    }

    // calcuate the outcome
    if (countFail === 0) {
      outcome = 'succeeded';
    } else if (countFail === 1 && requiresTwoFails === true) {
      outcome = 'succeeded';
    } else {
      outcome = 'failed';
    }

    return outcome;
  }

  checkRoleCardSpecialMoves(socket, data) {
    let foundSomething = false;

    for (let i = 0; i < this.roleKeysInPlay.length; i++) {
      if (!this.specialRoles[this.roleKeysInPlay[i]].checkSpecialMove) {
        continue;
      }

      if (
        this.specialRoles[this.roleKeysInPlay[i]].checkSpecialMove(
          socket,
          data,
        ) === true
      ) {
        foundSomething = true;
        break;
      }
    }
    // If we haven't found something in the roles, check the cards
    if (foundSomething === false) {
      for (let i = 0; i < this.cardKeysInPlay.length; i++) {
        // If the function doesn't exist, return null
        if (!this.specialCards[this.cardKeysInPlay[i]].checkSpecialMove) {
          continue;
        }

        if (
          this.specialCards[this.cardKeysInPlay[i]].checkSpecialMove(
            socket,
            data,
          ) === true
        ) {
          foundSomething = true;
          break;
        }
      }
    }

    return foundSomething;
  }

  getRoleCardPublicGameData() {
    const allData = {
      roles: {},
      cards: {},
    };
    for (let i = 0; i < this.roleKeysInPlay.length; i++) {
      // If the function doesn't exist, return null
      if (!this.specialRoles[this.roleKeysInPlay[i]].getPublicGameData) {
        continue;
      }

      const data =
        this.specialRoles[this.roleKeysInPlay[i]].getPublicGameData();
      Object.assign(allData.roles, data);
    }

    for (let i = 0; i < this.cardKeysInPlay.length; i++) {
      // If the function doesn't exist, return null
      if (!this.specialCards[this.cardKeysInPlay[i]].getPublicGameData) {
        continue;
      }

      const data =
        this.specialCards[this.cardKeysInPlay[i]].getPublicGameData();
      Object.assign(allData.cards, data);
    }

    return allData;
  }

  // If entries don't exist for current missionNum and pickNum, create them
  VHCheckUndefined() {
    for (let i = 0; i < this.playersInGame.length; i++) {
      if (
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ] === undefined
      ) {
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ] = [];
      }
      if (
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ][this.pickNum - 1] === undefined
      ) {
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ][this.pickNum - 1] = '';
      }
    }
  }

  VHUpdateTeamPick() {
    this.VHCheckUndefined();

    for (let i = 0; i < this.playersInGame.length; i++) {
      if (
        this.proposedTeam.indexOf(
          this.playersInGame[i].request.user.username,
        ) !== -1
      ) {
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ][this.pickNum - 1] += 'VHpicked ';
      }

      if (i === this.teamLeader) {
        this.voteHistory[this.playersInGame[i].request.user.username][
          this.missionNum - 1
        ][this.pickNum - 1] += 'VHleader ';
      }
    }
  }

  VHUpdateTeamVotes() {
    this.VHCheckUndefined();

    for (let i = 0; i < this.playersInGame.length; i++) {
      this.voteHistory[this.playersInGame[i].request.user.username][
        this.missionNum - 1
      ][this.pickNum - 1] += `VH${this.votes[i]}`;
    }
  }

  anonVoteHistory() {
    const newObj = {};
    for (const username in this.voteHistory) {
      newObj[this.anonymizer.anon(username)] = this.voteHistory[username];
    }
    return newObj;
  }

  submitMerlinGuess(guesserUsername, targetUsername) {
    // Check Merlin is in play
    if (this.resRoles.indexOf(Role.Merlin) === -1) {
      return 'This game does not include Merlin.';
    }

    if (!targetUsername) {
      return 'User not specified.';
    }
    const targetUsernameCase = this.playerUsernamesInGame.find(
      (p) => p.toLowerCase() === targetUsername.toLowerCase(),
    );

    // Check the guesser isnt guessing himself
    if (guesserUsername === targetUsernameCase) {
      return 'You cannot guess yourself.';
    }

    // Check the target is even playing
    if (!targetUsernameCase) {
      return 'No such user is playing at your table.';
    }

    // Check the guesser isnt Merlin/Percy
    const guesserPlayer = this.playersInGame.find(
      (player) => player.username === guesserUsername,
    );
    if (
      guesserPlayer !== undefined &&
      rolesThatCantGuessMerlin.indexOf(guesserPlayer.role) !== -1
    ) {
      return `${guesserPlayer.role} cannot submit a guess.`;
    }

    // Accept the guess
    this.merlinguesses[guesserUsername] = targetUsernameCase;
    return `You have guessed that ${targetUsernameCase} is Merlin. Good luck!`;
  }

  togglePause(modUsername) {
    const rolePrefix = modOrTOString(modUsername);

    // if paused, we unpause
    if (this.phase === Phase.Paused) {
      this.sendText(
        `${rolePrefix} ${modUsername} has unpaused the game.`,
        'server-text',
      );
      this.changePhase(this.phaseBeforePause);
      this.distributeGameData();
    }
    // if unpaused, we pause
    else {
      this.sendText(
        `${rolePrefix} ${modUsername} has paused the game.`,
        'server-text',
      );
      // store the current phase, change to paused and update.
      this.phaseBeforePause = this.phase;
      this.changePhase(Phase.Paused);
      this.distributeGameData();
    }
  }

  votePauseTimeout(socket: SocketUser, leaveTriggered: boolean): void {
    // Verify they are in the game.
    if (!this.usernameIsPlayer(socket.request.user.username)) {
      if (!leaveTriggered) {
        sendReplyToCommand(socket, 'You are not a player in this game.');
      }
      return;
    }

    if (!this.gameStarted) {
      if (!leaveTriggered) {
        sendReplyToCommand(
          socket,
          'The game has not started. You cannot pause the timer.',
        );
      }
      return;
    }

    if (this.phase === Phase.Assassination && leaveTriggered) {
      return;
    }

    if (this.finished) {
      if (!leaveTriggered) {
        sendReplyToCommand(
          socket,
          'The game has finished. You cannot pause the timer.',
        );
      }
      return;
    }

    if (!this.gameTimer.isTimerActive()) {
      if (!leaveTriggered) {
        sendReplyToCommand(socket, 'There is no active timer currently.');
      }
      return;
    }

    if (
      this.gameTimer.votePauseTimeout(
        socket.request.user.username,
        leaveTriggered,
      )
    ) {
      this.sendText(`Timeout has been paused.`, 'server-text');
      this.dateTimerExpires = new Date(0);
    }

    // To update the timer data on clients side
    this.distributeGameData();
  }

  voteUnpauseTimeout(socket: SocketUser): void {
    // Verify they are in the game.
    if (!this.usernameIsPlayer(socket.request.user.username)) {
      sendReplyToCommand(socket, 'You are not a player in this game.');
      return;
    }

    if (!this.gameStarted) {
      sendReplyToCommand(
        socket,
        'The game has not started. You cannot unpause the timer.',
      );
      return;
    }

    if (this.finished) {
      sendReplyToCommand(
        socket,
        'The game has finished. You cannot unpause the timer.',
      );
      return;
    }

    if (!this.gameTimer.isTimerActive()) {
      sendReplyToCommand(socket, 'There is no active timer currently.');
      return;
    }

    this.sendText(`A player has unpaused the timeout.`, 'server-text');

    this.dateTimerExpires = this.gameTimer.voteUnpauseTimeout();

    // To update the timer data on clients side
    this.distributeGameData();
  }

  private announceIllusionsIfAny() {
    // Melron
    const melronRole = this.specialRoles[Role.Melron];
    if (melronRole) {
      const data = melronRole.getPublicGameData();
      if (data.spiesMelronSaw) {
        this.sendText(
          `Melron saw as spies: ${data.spiesMelronSaw.join(', ')}`,
          'gameplay-text-blue',
        );
      }
    }

    // Moregano
    const moreganoRole = this.specialRoles[Role.Moregano];
    if (moreganoRole) {
      const data = moreganoRole.getPublicGameData();
      if (data.spiesMoreganoSaw)
      {
        this.sendText(
          `Moregano saw as spies: ${data.spiesMoreganoSaw.join(', ')}`,
          'gameplay-text-red',
        );
      }
    }
  }

  private usernameIsPlayer(username: string) {
    return (
      this.playersInGame.filter(
        (player) => player.username.toLowerCase() === username.toLowerCase(),
      ).length === 1
    );
  }

  voteVoidGame(socket: SocketUser): void {
    // Verify they are in the game.
    if (!this.usernameIsPlayer(socket.request.user.username)) {
      socket.emit('messageCommandReturnStr', {
        message: 'You are not a player in this game.',
        classStr: 'server-text',
      });
      return;
    }

    if (!this.gameStarted) {
      socket.emit('messageCommandReturnStr', {
        message: 'The game has not started. You cannot void the game.',
        classStr: 'server-text',
      });
      return;
    }

    if (this.finished) {
      socket.emit('messageCommandReturnStr', {
        message: 'The game has finished. You cannot void the game.',
        classStr: 'server-text',
      });
      return;
    }

    if (this.voidGameTracker.playerVoted(socket.request.user.username)) {
      gamesPlayedMetric.inc(1, { status: 'voided' });

      this.changePhase(Phase.Voided);
      this.sendText(`Game has been voided.`, 'server-text');
    }

    // To update the timer data on clients side
    this.distributeGameData();
  }

  canRoomChat(usernameLower: string) {
    if (this.gameStarted === false) {
      return true;
    }

    if (this.muteSpectators) {
      const playerUsernamesLower: string[] = this.playersInGame.map(
        (player: any) => player.username.toLowerCase(),
      );

      return (
        playerUsernamesLower.includes(usernameLower) ||
        isMod(usernameLower) ||
        isTO(usernameLower) ||
        isDev(usernameLower)
      );
    }
    return true;
  }

  updateMuteSpectators(muteSpectators: boolean) {
    if (this.gameStarted === false) {
      this.muteSpectators = muteSpectators;

      this.sendText(
        `Mute spectators option set to ${muteSpectators}.`,
        'server-text',
      );
    }
  }

  updateDisableVoteHistory(disableVoteHistory: boolean) {
    if (this.gameStarted === false) {
      this.disableVoteHistory = disableVoteHistory;

      this.sendText(
        `Disable Vote History option set to ${disableVoteHistory}.`,
        'server-text',
      );
    }
  }

  /*
  ELO RATING CALCULATION:

  Usual formula: R_new = R_old + k(Actual - Expected)

  1. Use average team rating and pit together in a 1v1 format.
  2. Adjust ratings for Res and Spy winrates (constant adjustment based on site winrates, maybe for that player size).
  2. Using k-value k=38, calculate adjustment amount = k(Actual - Expected)
      a. Actual = 1 for win, 0 for loss
      b. Expected = 1/(1 + 10^-(R_old - R_opp)/400)
  3. Multiplicative adjustment based on player size.
  4. If provisional players are in the game, adjust the elo changes based on how close they are to being experienced.
  5. Divide equally between players on each team and adjust ratings. (Done in the finishGame function)
  */
  calculateResistanceRatingChange(winningTeam, provisionalGame) {
    // Constant changes in elo due to unbalanced winrate, winrate changes translated to elo points.
    const playerSizeEloChanges = [62, 56, 71, 116, 18, 80];
    // k value parameter for calculation
    const k = 42;
    // Calculate ratings for each team by averaging elo of players
    const resTeamEloRatings = this.playersInGame
      .filter((soc) => soc.alliance === Alliance.Resistance)
      .map((soc) => soc.request.user.playerRating);
    const spyTeamEloRatings = this.playersInGame
      .filter((soc) => soc.alliance === Alliance.Spy)
      .map((soc) => soc.request.user.playerRating);

    let total = 0;
    for (let i = 0; i < resTeamEloRatings.length; i++) {
      total += resTeamEloRatings[i];
    }
    let resElo = total / resTeamEloRatings.length;

    total = 0;
    for (let i = 0; i < spyTeamEloRatings.length; i++) {
      total += spyTeamEloRatings[i];
    }
    let spyElo = total / spyTeamEloRatings.length;

    // Adjust ratings for sitewide winrates. Using hardcoded based on current.
    spyElo += playerSizeEloChanges[this.playersInGame.length - 5];

    console.log('Resistance Team Elo: ' + resElo);
    console.log('Spy Team Elo: ' + spyElo);

    // Calculate elo change, adjusting for player size, difference is 1- or just -
    let eloChange = 0;
    if (winningTeam === Alliance.Resistance) {
      eloChange =
        k *
        (1 - 1 / (1 + Math.pow(10, -(resElo - spyElo) / 500))) *
        (this.playersInGame.length / 5); //smoothed from 400 to 500 division
    } else if (winningTeam === Alliance.Spy) {
      eloChange =
        k *
        (-1 / (1 + Math.pow(10, -(resElo - spyElo) / 500))) *
        (this.playersInGame.length / 5); //smoothed from 400 to 500 division
    } else {
      // winning team should always be defined
      this.sendText(
        'Error in elo calculation, no winning team specified.',
        'server-text',
      );
      return;
    }

    // If the game is provisional, apply a multiplicative reduction in elo change based on how experienced the players are.
    if (provisionalGame) {
      const provisionalPlayers = this.playersInGame.filter(
        (soc) => soc.request.user.ratingBracket === 'unranked',
      );
      let totalProvisionalGames = 0;
      for (let i = 0; i < provisionalPlayers.length; i++) {
        totalProvisionalGames +=
          provisionalPlayers[i].request.user.totalRankedGamesPlayed;
      }
      eloChange =
        ((totalProvisionalGames +
          (this.playersInGame.length - provisionalPlayers.length) *
            this.provisionalGamesRequired) /
          (this.provisionalGamesRequired * this.playersInGame.length)) *
        eloChange;
    }
    return eloChange;
  }

  /*
  PROVISIONAL ELO RATING CALCULATION:

  If there is only one provisional player in the game:
  Formula: R_new = (R_old*N_old + sum(otherPlayerRatings)/numOtherPlayers + 200*TeamAdjustment*Result)/(N_old+1)
      where N_old = Number of games played
            Result = 1 for win, 0 for loss

  If there is more than one provisional player in the game:
  Formula: R_new = (R_old*N_old + sum(allPlayerRatings)/numPlayers + 200*TeamAdjustment*Result)/(N_old+1)
      where N_old = Number of games played
            Result = 1 for win, 0 for loss

  This rating style takes into account all the ratings of the players in the games that you play with to determine your starting point.
  For the first few games it will result in wild rating changes, but will level out towards the end of the provisional section.
  Could possibly lead to some people abusing their early rating by only playing with strong players and getting lucky, but should level out in the end.
  */
  calculateNewProvisionalRating(winningTeam, playerSocket, playerRatings) {
    // Constant changes in elo due to unbalanced winrate, winrate changes translated to elo points.
    const playerSizeWinrates = [0.57, 0.565, 0.58, 0.63, 0.52, 0.59];
    let Result = playerSocket.alliance === winningTeam ? 1 : -1;

    // Calculate new rating
    const R_old = playerSocket.request.user.playerRating;
    const N_old = playerSocket.request.user.totalRankedGamesPlayed;
    const ratingsSum = playerRatings.reduce((sum, a) => sum + a, 0);

    // Prototype team adjustment is hardcoded, players are rewarded more for winning and penalised less for losing as res.
    // Also all changes are scaled with relation to team size to prevent deflation in provisional games.
    let teamAdj = 0;
    const resReduction =
      this.spyUsernames.length / this.resistanceUsernames.length;
    const sizeWinrate = playerSizeWinrates[this.playersInGame.length - 5];
    if (playerSocket.alliance === Alliance.Resistance) {
      if (winningTeam === playerSocket.alliance) {
        teamAdj = (sizeWinrate / (1 - sizeWinrate)) * resReduction;
      } else {
        teamAdj = resReduction;
      }
    } else {
      if (winningTeam === playerSocket.alliance) {
        teamAdj = 1;
      } else {
        teamAdj = sizeWinrate / (1 - sizeWinrate);
      }
    }

    let newRating =
      (R_old * N_old +
        ratingsSum / playerRatings.length +
        200 * teamAdj * Result) /
      (N_old + 1);

    // Prevent losing rating on win and gaining rating on loss in fringe scenarios with weird players.
    if (
      (winningTeam === playerSocket.alliance && newRating < R_old) ||
      (!(winningTeam === playerSocket.alliance) && newRating > R_old)
    ) {
      newRating = R_old;
    }
    if (winningTeam === playerSocket.alliance && newRating > R_old + 100) {
      newRating = R_old + 100;
    }
    if (!(winningTeam === playerSocket.alliance) && newRating < R_old - 100) {
      newRating = R_old - 100;
    }
    return newRating;
  }
}

export default Game;

// Helpful functions

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

function generateAssignmentOrders(num) {
  let rolesAssignment = [];

  // create the starting array for role assignment
  for (let i = 0; i < num; i++) {
    rolesAssignment[i] = i;
  }

  // shuffle
  rolesAssignment = shuffleArray(rolesAssignment);
  // console.log(rolesAssignment);

  return rolesAssignment;
}

function getAllSpies(thisRoom) {
  if (thisRoom.gameStarted === true) {
    const array = [];
    for (let i = 0; i < thisRoom.playersInGame.length; i++) {
      if (thisRoom.playersInGame[i].alliance === Alliance.Spy) {
        array.push(
          thisRoom.anonymizer.anon(thisRoom.playersInGame[i].username),
        );
      }
    }
    return array;
  }

  return false;
}

function getRevealedRoles(thisRoom) {
  if (thisRoom.gameStarted === true && thisRoom.phase === Phase.Finished) {
    const array = [];
    for (let i = 0; i < thisRoom.playersInGame.length; i++) {
      array.push(thisRoom.playersInGame[i].role);
    }
    return array;
  }
  return false;
}

function getUsernamesOfPlayersInRoom(thisRoom) {
  if (thisRoom.gameStarted === true) {
    const array = [];
    for (let i = 0; i < thisRoom.socketsOfPlayers.length; i++) {
      array.push(thisRoom.socketsOfPlayers[i].request.user.username);
    }
    return array;
  }

  return [];
}

function getUsernamesOfPlayersInGame(thisRoom) {
  if (thisRoom.gameStarted === true) {
    const array = [];
    for (let i = 0; i < thisRoom.playersInGame.length; i++) {
      array.push(thisRoom.playersInGame[i].username);
    }
    return array;
  }

  return [];
}

function gameReverseArray(arr) {
  if (arr.length == 0) {
    return [];
  }
  const firstEntry = arr.slice(0, 1);
  const remainder = arr.slice(1);
  const reversedRem = remainder.reverse();

  // console.log(firstEntry);
  // console.log(reversedRem);

  return firstEntry.concat(reversedRem);
}

function gameReverseIndex(num, numPlayers) {
  if (num == 0) {
    return 0;
  }

  return numPlayers - num;
}

const id = function (x) {
  return x;
};

let reverseMapFromMap = function (map, f) {
  return Object.keys(map).reduce((acc, k) => {
    acc[map[k]] = (acc[map[k]] || []).concat((f || id)(k));
    return acc;
  }, {});
};
