import {
  IsString,
  IsEnum,
  IsInt,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';
import 'reflect-metadata';

export enum GameSocketEvents {
  UPDATE_GAME = 'UPDATE_GAME',
  PICK = 'PICK',
  VOTE_TEAM = 'VOTE_TEAM',
  VOTE_MISSION = 'VOTE_MISSION',
}

// Game data
export enum MissionOutcome {
  success = 'success',
  fail = 'fail',
}

export class Proposal {
  @IsString()
  leaderUsername!: string;

  @IsString({
    each: true,
  })
  team!: string[];

  @IsNotEmptyObject()
  // Holds <username>: <approve/reject>
  votes!: Record<string, VoteTeamOutcome>;
}

export class MissionHistory {
  @IsInt()
  fails!: number;

  @ValidateNested()
  proposals!: Proposal[];
}

export class GameHistory {
  @IsEnum(MissionOutcome, {
    each: true,
  })
  missionOutcome!: MissionOutcome[];

  @IsEnum(MissionHistory, {
    each: true,
  })
  missionHistory!: MissionHistory[];
}

// TODO Update this with the state machine possible states
export enum GameState {
  pick = 'pick',
  voteTeam = 'voteTeam',
  voteMission = 'voteMission',
  finished = 'finished',
}

export class GameData {
  @IsEnum(GameState)
  state!: GameState;

  @ValidateNested({ each: true })
  history!: GameHistory;
}

// Class to wrap game events
export enum GameEvents {
  PICK = 'PICK',
  VOTE_TEAM = 'VOTE_TEAM',
  VOTE_MISSION = 'VOTE_MISSION',
}

export class GameEvent {
  @IsEnum(GameEvents)
  type!: GameEvents;

  // Data will hold the relevant GameEvent<event> data
  data!: any;
}

export class PickData {
  @IsString({
    each: true,
  })
  team!: string[];
}

export enum VoteTeamOutcome {
  approve = 'approve',
  reject = 'reject',
}

export class VoteTeamData {
  @IsEnum(VoteTeamOutcome)
  vote!: VoteTeamOutcome;
}

export class VoteMissionData {
  @IsEnum(MissionOutcome)
  vote!: MissionOutcome;
}

export enum Alliance {
  resistance = 'resistance',
  spy = 'spy',
}
