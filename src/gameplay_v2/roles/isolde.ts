import Entity from './entity';
import { Alliance } from '../gameTypes';

export default class Isolde extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Tristan and Isolde both see each other.';
    //this.components.push(new seetristanIsoldeC());  
  }
}