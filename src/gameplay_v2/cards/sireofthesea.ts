import { Round } from '../gameTypes';
import CardEntity from './cardEntity';
import { revealAllianceC } from './components/revealAllianceC';

export default class SireOfTheSea extends CardEntity {
  description: string;
  entityMap = new Map<Round, string>();
    constructor() {
        super(Round.AnyRound);
        this.description = "Reveals the card holder's alliance to the person being carded.";
        this.entityMap.set(Round.AnyRound, this.description);
    }
}