import Entity from './entity';
import { Alliance } from '../gameTypes';
import { VoteC } from './components/vote';

export default class Oberon extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Spy);
    this.description = 'Oberon and Spies do not know each other.';
    this.components.push(new VoteC());
    this.entityMap.set(Alliance.Spy, this.description);
  }
}