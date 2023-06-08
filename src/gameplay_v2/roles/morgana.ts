import Entity from './entity';
import { Alliance } from '../gameTypes';
import { SeeSpiesC } from './components/seeSpies';
import { VoteC } from './components/vote';

export default class Morgana extends Entity {
  description: string;
  entityMap = new Map<Alliance, string>();

  constructor() {
    super(Alliance.Spy);
    this.description = 'A spy who looks like Merlin to Percival.';
    this.addComponent(new SeeSpiesC());  
    this.addComponent(new VoteC());
    this.entityMap.set(Alliance.Spy, this.description);
  }
}