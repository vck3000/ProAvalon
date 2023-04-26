import Entity from './entity';
import { Alliance } from '../gameTypes';

export default class Morgana extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'A spy who looks like Merlin to Percival.';
    //this.components.push(new seeSpiesC());  
  }
}