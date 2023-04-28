import Entity from './entity';
import { Alliance } from '../gameTypes';
import { assassinateC } from './components/assassinate';

export default class Assassin extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
    this.components.push(new assassinateC());  
  }
}