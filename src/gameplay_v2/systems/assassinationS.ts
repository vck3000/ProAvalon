
import { SendData, System } from './system';
import { GameData } from '../gameEngine';
import { Mission, MissionC } from '../roles/components/mission';
import { Alliance, Role } from '../gameTypes';
import { Player } from '../player';

// As the other components not finished yet , I will start with pesodo code
export class assassinationS implements System {
    run(gameData: GameData, sendData: SendData): void {


        // Get all player information as a list from 
        // GameData which is input of the functions:
        const playerList: Player[] = gameData.players;

        // get how many missions already completed:
        //To Be Done as voteMissionS not completed yet

        //check if there are 3 missions that are won by Resistance

        // if greater than 3 mission or equal to 3 mission successful, 
        // then spy win, execute this phase.
        //if(mission > 3 || mission === 3){
        //assassination select merlin:

        // Format is string, which store the user name of the merlin
        const merlinName = '';

        for (const player of playerList) {
            if (
                player.alliance === Alliance.Merlin,
                ) {


                merlinName = player.username;
            }
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
