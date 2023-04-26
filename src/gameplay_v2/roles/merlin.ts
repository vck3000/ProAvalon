import Entity from './entity';
import { Alliance } from '../gameTypes';
import { SeeSpiesC } from './components/seeSpies';
import { VoteC } from './components/vote';

export default class Merlin extends Entity {
  description: string;

  constructor() {
    super(Alliance.Resistance);
    this.description = 'Knows the identity of the spies.';
    this.components.push(new SeeSpiesC());
    this.components.push(new VoteC());
  }
}
