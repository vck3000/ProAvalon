import Entity from './entity';
import { Alliance } from '../gameTypes';

export default class Percival extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Knows the identity of Merlin and Morgana.';
    //this.components.push(new seeMerlinC());  
    //this.components.push(new seeMorganaC());  
  }
}