import { SocketUser } from '../sockets/types';

export enum Phase {
  // Core phases
  pickingTeam = 'pickingTeam',
  votingTeam = 'votingTeam',
  votingMission = 'votingMission',
  finished = 'finished',

  // Extra roles/cards
  assassination = 'assassination',
  lady = 'lady',
  ref = 'ref',
  sire = 'sire',

  // Misc
  paused = 'paused',
  frozen = 'frozen',
}

// This is needed to tell if we need to timer it.
// TODO: We should think of a better way instead of having to maintain this list.
const gamePhases = [
  Phase.pickingTeam,
  Phase.votingTeam,
  Phase.votingMission,
  Phase.finished,
  Phase.assassination,
  Phase.lady,
  Phase.ref,
  Phase.sire,
];

export function isGamePhase(phase: Phase): boolean {
  return gamePhases.includes(phase);
}

interface OneButtonSettings {
  hidden: boolean;
  disabled: boolean;
  setText: string;
}

export interface ButtonSettings {
  green: OneButtonSettings;
  red: OneButtonSettings;
}

export interface IPhase {
  showGuns: boolean;

  gameMove(
    socket: SocketUser,
    buttonPressed: string,
    selectedPlayers: string[],
  ): void;

  buttonSettings(indexOfPlayer: number): ButtonSettings;

  numOfTargets(indexOfPlayer: number): number | number[];

  getStatusMessage(indexOfPlayer: number): string;

  getProhibitedIndexesToPick(indexOfPlayer: number): number[];
}
