import { Round } from '../gameTypes';
import CardEntity from './cardEntity';
import { revealAllianceC } from './components/revealAllianceC';

export default class RefOfTheRain extends CardEntity {
  description: string;
  entityMap = new Map<Round, string>();

    constructor() {
        super(Round.AnyRound);
        this.description = 'Reveals the alliance of the person being carded to the card holder. The card is used after the previous mission fails.';
        this.entityMap.set(Round.AnyRound, this.description);
    }
}