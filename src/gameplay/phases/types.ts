import { SocketUser } from '../../sockets/types';

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
  // This currently decides whether the button is initially disabled, but is overridden in the client side e.g.
  // when enough avatars are selected. However, I believe this shouldn't be necessary if used in combination with
  // maxNumPlayers which is also defined in each Phase.
  // TODO remove this disabled field.
  // Can't think of a case where something is hidden but not disabled.
  disabled: boolean;
  setText: string;
}

export interface ButtonSettings {
  green: OneButtonSettings;
  red: OneButtonSettings;
}

export interface IPhase {
  phase: Phase;
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
