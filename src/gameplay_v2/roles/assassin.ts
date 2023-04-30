import Entity from './entity';
import { Alliance } from '../gameTypes';
import { assassinateC } from './components/assassinate';
import { VoteC } from './components/vote';

export default class Assassin extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Spy);
    this.description = 'If the resistance win 3 missions, the Assassin can shoot one person for Merlin, or two people for Tristan and Isolde. If they are correct, the spies win!';
    this.components.push(new assassinateC());  
    this.components.push(new VoteC());
    this.entityMap.set(Alliance.Spy, this.description);
  }
}