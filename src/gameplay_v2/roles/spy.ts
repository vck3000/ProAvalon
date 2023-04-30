import { Alliance } from '../gameTypes';
import { SeeSpiesC } from './components/seeSpies';
import { VoteC } from './components/vote';
import Entity from './entity'

export default class Spy extends Entity{
    description: string;
    entityMap = new Map<Alliance, string>();

    constructor(alliance: Alliance){
        super(Alliance.Spy);
        this.description = 'A standard spy member';
        this.components.push(new SeeSpiesC());  
        this.components.push(new VoteC());
        this.entityMap.set(Alliance.Spy, this.description);
    }
}