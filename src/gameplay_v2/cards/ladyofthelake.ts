import { Round } from '../gameTypes';
import CardEntity from './cardEntity';
import { revealAllianceC } from './components/revealAllianceC';

export default class LadyOfTheLake extends CardEntity {
  description: string;
  entityMap = new Map<Round, string>();

  constructor() {
    super(Round.Round_2);
    this.description = 'Reveals the alliance of the person being carded to the card holder. The card is used after each Mission after Mission 2.';
    this.entityMap.set(Round.AnyRound, this.description);
  }
}