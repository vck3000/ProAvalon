import { IsString, IsEnum, IsInt } from 'class-validator';
import { CreateGameDto } from '@proavalon/proto';

type MissionOutcome = 'success' | 'fail';

export enum GameRoomState {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

// TODO Update this with the state machine.
export enum GameStateType {
  PICKING = 'PICKING',
  VOTING_TEAM = 'VOTING_TEAM',
  VOTING_MISSION = 'VOTING_MISSION',
}

export class GameState extends CreateGameDto {
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

  @IsEnum(GameStateType)
  state!: GameStateType;

  data!: object; // State relevant information

  missionHistory!: MissionOutcome[];
  numFailsHistory!: number[];
}
