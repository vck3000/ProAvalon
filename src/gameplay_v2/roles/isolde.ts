import Entity from './entity';
import { Alliance } from '../gameTypes';
import { SeeTristanIsoldeC } from './components/seeTristanIsolde';
import { VoteC } from './components/vote';

export default class Isolde extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Tristan and Isolde both see each other.';
    this.components.push(new SeeTristanIsoldeC());  
    this.components.push(new VoteC());
    this.entityMap.set(Alliance.Resistance, this.description);
  }
}