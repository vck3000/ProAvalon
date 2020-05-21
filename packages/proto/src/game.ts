import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';
import 'reflect-metadata';

export enum GameMode {
  VANILLA = 'VANILLA',
  AVALON = 'AVALON',
}
export class CreateGameDto {
  // No need for validators here as it is validated within GameState
  @IsInt()
  @Min(0)
  @Max(10)
  maxNumPlayers!: number;

  @IsOptional()
  @IsString()
  joinPassword!: string | undefined;

  @IsEnum(GameMode)
  mode!: GameMode;
}

// Join and leave
export class JoinGame {
  @IsNumber()
  id!: number;
}

export class LeaveGame {
  @IsNumber()
  id!: number;
}

// Game data
export enum MissionOutcome {
  success = 'success',
  fail = 'fail',
}

export class LobbyGame {
  @IsNumber()
  id!: number;

  @IsEnum(MissionOutcome, {
    each: true,
  })
  missionHistory!: MissionOutcome[];

  @IsString()
  host!: string;

  @IsEnum(GameMode)
  mode!: string;

  @IsInt()
  spectators!: number;

  @IsString({
    each: true,
  })
  avatarLinks!: string[];
}

export class Proposal {
  @IsString()
  leader!: string;

  @IsString({
    each: true,
  })
  team!: string[];

  @IsNotEmptyObject()
  // Holds <username>: <true(approve)/false(reject)>
  votes!: Record<string, boolean>;
}

export class MissionHistory {
  @IsInt()
  fails!: number;

  @ValidateNested()
  proposals!: Proposal[];
}

// Game Data
export enum GameRoomState {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

// TODO Update this with the state machine.
export enum GameState {
  PICKING = 'PICKING',
  VOTING_TEAM = 'VOTING_TEAM',
  VOTING_MISSION = 'VOTING_MISSION',
}

export class GameData extends CreateGameDto {
  // Room related state
  @IsInt()
  id!: number;

  @IsString()
  host!: string; // holds a displayUsername

  @IsEnum(GameRoomState)
  roomState!: GameRoomState;

  @IsString({
    each: true,
  })
  kickedPlayers!: string[]; // holds usernames (lowercased)
  claimingPlayers!: string[]; // holds usernames (lowercased)

  // Game related state
  playerUsernames!: string[];

  roles!: object; // This will hold all the role states

  @IsEnum(GameState)
  state!: GameState;

  data!: object; // State relevant information

  @ValidateNested({ each: true })
  history!: MissionHistory[];
}
