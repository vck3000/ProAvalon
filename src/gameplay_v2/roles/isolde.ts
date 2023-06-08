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
    this.addComponent(new SeeTristanIsoldeC());  
    this.addComponent(new VoteC());
    this.entityMap.set(Alliance.Resistance, this.description);
  }
}