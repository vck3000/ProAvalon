import Entity from './entity';
import { Alliance } from '../gameTypes';

export default class Mordred extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'A spy who is invisible to Merlin.';
    //this.components.push(new hideFromMerlinC());  
  }
}