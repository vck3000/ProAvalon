import Entity from './entity';
import { Alliance } from '../gameTypes';

export default class Oberon extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Oberon and Spies do not know each other.';
    //this.components.push(new hideFromSpiesC());  
  }
}