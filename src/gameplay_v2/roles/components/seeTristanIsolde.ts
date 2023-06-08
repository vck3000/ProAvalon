import Component from './component';

export class SeeTristanIsoldeC extends Component {
  nameC = 'SeeTristanIsoldeC';
  data = {};
}

export interface SeeData {
  see: See;
}

export enum See {
  Mordred,
  Morgana,
  Percival,
  Spies,
  Merlin,
  Assassin
}