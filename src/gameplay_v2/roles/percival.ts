import Entity from './entity';
import { Alliance } from '../gameTypes';
import { SeeMerlinC } from './components/seeMerlin';
import { SeeMorganaC } from './components/seeMorgana';
import { VoteC } from './components/vote';
import { SeePercivalC } from './components/seePercival';

export default class Percival extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Knows the identity of Merlin and Morgana.';
    this.components.push(new SeePercivalC());
    this.components.push(new VoteC());
    this.entityMap.set(Alliance.Resistance, this.description);
  }
}