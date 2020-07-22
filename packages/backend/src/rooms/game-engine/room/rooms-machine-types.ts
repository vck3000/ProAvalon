import { GameMode, RoomState, RoomSocketEvents } from '@proavalon/proto/room';
import {
  GameState,
  PickData,
  VoteTeamData,
  GameHistory,
  GameSocketEvents,
  VoteMissionData,
} from '@proavalon/proto/game';
import { Entity } from '../ecs/game-entity';

export interface PlayerInfo {
  socketId: string;
  displayUsername: string;
}

export interface MachineGameData {
  leader: number;
  team: string[];
  gameSize: number;
  gameHistory: GameHistory;
}

export declare class MachineRoomData {
  id: number;
  host: string;
  mode: GameMode;
  roles: string[];
  kickedPlayers: string[];
  gameBarMsg: string;
}

export interface RoomContext {
  entities: Entity[];
  entityCount: number;
  systems: string[];
  gameData: MachineGameData;
  roomData: MachineRoomData;
  // TODO make this a literal type
  gameState: string;
}

export interface RoomStateSchema {
  states: {
    [RoomState.waiting]: {};
    [RoomState.game]: {
      states: {
        standard: {
          states: {
            [GameState.pick]: {};
            [GameState.voteTeam]: {};
            [GameState.voteMission]: {};
          };
        };
        special: {
          states: {
            idle: {};
            active: {};
          };
        };
      };
    };
    [RoomState.finished]: {};
  };
}

type BaseEvents =
  | { type: 'INITIAL_SETTINGS'; id: number; host: string }
  | { type: RoomSocketEvents.JOIN_ROOM; player: PlayerInfo }
  | { type: RoomSocketEvents.LEAVE_ROOM; player: PlayerInfo }
  | { type: RoomSocketEvents.SIT_DOWN; player: PlayerInfo }
  | { type: RoomSocketEvents.STAND_UP; player: PlayerInfo }
  | { type: RoomSocketEvents.START_GAME; player: PlayerInfo }
  | { type: 'GAME_END' };

type GameEvents =
  | { type: GameSocketEvents.PICK; player: PlayerInfo; data: PickData }
  | { type: GameSocketEvents.VOTE_TEAM; player: PlayerInfo; data: VoteTeamData }
  | {
      type: GameSocketEvents.VOTE_MISSION;
      player: PlayerInfo;
      data: VoteMissionData;
    };

type EntityEvents =
  | { type: 'SPECIAL_STATE_ENTER' }
  | { type: 'SPECIAL_STATE_LEAVE' }
  | { type: 'SPECIAL'; specialType: string; data: any; player: PlayerInfo }
  | { type: 'ADD_SYSTEM'; systemName: string };

export type RoomEvents = BaseEvents | GameEvents | EntityEvents;
