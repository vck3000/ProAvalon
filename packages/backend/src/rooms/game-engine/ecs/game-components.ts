/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-interface */

import {
  VoteTeamOutcome,
  GameData,
  GameState,
  MissionOutcome,
} from '@proavalon/proto/game';
import { ROLES } from './game-assemblages';
import { PlayerInfo } from '../room/rooms-machine-types';

export type AllComponents =
  | CPlayer
  | CAlliance
  | CRole
  | CVoteTeam
  | CVoteMission
  | CSeeAlliance
  | CAssassin;

export class Component {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class CPlayer extends Component {
  socketId: string;
  displayUsername: string;
  satDown: boolean;
  gameDataToUser: GameData;

  constructor(playerInfo: PlayerInfo) {
    super('CPlayer');
    this.socketId = playerInfo.socketId;
    this.displayUsername = playerInfo.displayUsername;
    this.satDown = false;

    // Some hard coded initial data
    this.gameDataToUser = {
      state: GameState.pick,
      history: {
        missionOutcome: [],
        missionHistory: [],
      },
    };
  }
}

type Alliance = 'resistance' | 'spy';
export class CAlliance extends Component {
  alliance: Alliance;

  constructor(alliance: Alliance) {
    super('Alliance');
    this.alliance = alliance;
  }
}

export class CRole extends Component {
  role: string;

  constructor(role: ROLES) {
    super('CRole');
    this.role = role;
  }
}

export class CVoteTeam extends Component {
  vote: VoteTeamOutcome | undefined;

  constructor() {
    super('CVoteTeam');
    this.vote = undefined;
  }
}

export class CVoteMission extends Component {
  vote?: MissionOutcome;

  constructor() {
    super('CVoteMission');
    this.vote = undefined;
  }
}

export class CSeeAlliance extends Component {
  visibleRoles: ROLES[];

  constructor(visibleRoles: ROLES[] | 'all') {
    super('CSeeAlliance');

    // Default see ALL roles.
    // TODO Update this for Oberon later.
    if (visibleRoles === 'all') {
      this.visibleRoles = Object.values(ROLES) as ROLES[];
    } else {
      this.visibleRoles = visibleRoles;
    }
  }
}

export class CAssassin extends Component {
  active: boolean;
  finished: boolean;
  target: string | undefined;

  constructor() {
    super('CAssassin');
    this.active = false;
    this.finished = false;
    this.target = undefined;
  }
}
