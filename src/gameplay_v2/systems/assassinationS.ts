import { GameData } from '../gameEngine';
import { SendData, System } from './system';


export class assassinationS implements System{
    run(gameData: GameData, sendData: SendData): void {
        const playersComponents = [];
        //check if there are 3 missions that are won by Resistance

        //if(mission > 3 || mission === 3){
            //if so, then execute assassination phase where assassin selects the merlin
            //if correct, end the game as SPY_WIN
            //if not, then end the game with RESISTANCE_WIN
        
    }
}
