import {
  IsNumber,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
export enum GameMode {
  VANILLA = 'VANILLA',
  AVALON = 'AVALON',
}

// Game Data
export enum RoomState {
  waiting = 'waiting',
  game = 'game',
  finished = 'finished',
}

export class PlayerData {
  @IsString()
  displayUsername!: string;

  @IsString()
  avatarLink?: string;
}

export class RoomData {
  @IsInt()
  id!: number;

  @IsEnum(RoomState)
  state!: RoomState;

  @IsString()
  host!: string; // holds a displayUsername

  @IsEnum(GameMode)
  mode!: GameMode;

  // TODO Replace with allowed roles
  @IsString({
    each: true,
  })
  roles!: string[];

  @ValidateNested({ each: true })
  playerEntities!: PlayerData[];

  @IsString({
    each: true,
  })
  kickedPlayers!: string[]; // holds usernames (lowercased)
}

export class CreateRoomDto {
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

export class JoinGame {
  @IsNumber()
  id!: number;
}

// Do we need id here?
export class LeaveGame {
  @IsNumber()
  id!: number;
}

export class SitDown {
  @IsNumber()
  id!: number;
}

export class StandUp {
  @IsNumber()
  id!: number;
}
