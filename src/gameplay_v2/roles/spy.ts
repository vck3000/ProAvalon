import { Alliance } from '../gameTypes';
import Entity from './entity'

export default class Spy extends Entity{
    description: string;

    constructor(){
        super(Alliance.Resistance);
        this.description = 'A standard spy member';
    }
}