import { Alliance } from '../gameTypes';
import { VoteC } from './components/vote';
import Entity from './entity'

export default class Resistance extends Entity{
    description: string;
    entityMap = new Map<Alliance, string>();

    constructor(){
        super(Alliance.Resistance);
        this.description = 'A standard Resistance member.';
        this.components.push(new VoteC());
        this.entityMap.set(Alliance.Resistance, this.description);
    }

}