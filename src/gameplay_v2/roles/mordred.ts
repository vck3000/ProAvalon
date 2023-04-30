import Entity from './entity';
import { Alliance } from '../gameTypes';
import { VoteC } from './components/vote';

export default class Mordred extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Spy);
    this.description = 'A spy who is invisible to Merlin.';
    this.components.push(new VoteC());
    this.entityMap.set(Alliance.Spy, this.description);
  }
}