type MissionOutcome = 'success' | 'fail';

type GameMode = 'vanilla' | 'avalon';

type RoomStateType = 'waiting' | 'in-progress' | 'finished';

// TODO Update this with the state machine.
type GameStateType = '' | 'picking' | 'voting-team' | 'voting-mission';

export class GameState {
  // Room related state
  host!: string; // holds a displayUsername

  maxNumPlayers!: number; // that can sit down

  roomState!: RoomStateType;

  kickedPlayers!: string[]; // holds usernames (lowercased)
  claimingPlayers!: string[]; // holds usernames (lowercased)

  joinPassword!: string;
  gameMode!: GameMode;

  // Game related state
  playerUsernames!: string[];

  roles!: object; // This will hold all the role states

  state!: GameStateType;
  stateData!: object; // State relevant information

  missionHistory!: MissionOutcome[];
  numFailsHistory!: number[];
}
