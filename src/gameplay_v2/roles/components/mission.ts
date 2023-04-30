import Component from './component';

export class MissionC extends Component {
  name = 'Mission';
  data: MissionData = { mission: Mission.Null };
}

export interface MissionData {
  mission: Mission;
}

export enum Mission {
  Null,
  Sabotage,
  Support,
}

export enum MissionEndResult {
    Success,
    Failure,
}
