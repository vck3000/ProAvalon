import { GameData } from '../gameEngine';
import { SendData, System } from './system';

// As the other components not finished yet , I will start with pesodo code
export class assassinationS implements System {
    run(gameData: GameData, sendData: SendData): void {
        const playersComponents = [];
        //check if there are 3 missions that are won by Resistance

        // if greater than 3 mission or equal to 3 mission successful, 
        // then spy win, execute this phase.
        //if(mission > 3 || mission === 3){
        //assassination select merlin:
        const resistanceList = [];
        for (const player in GameData.players) {
            //if  player is resistance add them to spyList
        }
        // THen show assassination all resistance,
        // If assassination choose the correct one, then :
        if (assassination choose correct:) {
            //End the game, spy win
        }
            else {
            // res win
        }
        //if so, then execute assassination phase where assassin selects the merlin
        //if correct, end the game as SPY_WIN
        //if not, then end the game with RESISTANCE_WIN
    }
}
