import { Alliance } from '../gameTypes';
import Entity from './entity'

export default class Resistance extends Entity{
    description: string;

    constructor(alliance: Alliance){
        super(alliance = Alliance.Resistance);
        this.description = 'A standard Resistance member.';
    }

}