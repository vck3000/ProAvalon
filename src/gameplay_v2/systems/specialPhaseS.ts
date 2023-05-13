import { GameData } from '../gameEngine';
import { SendData, System } from './system';

export class soecialphaseS implements System {
    //Special Phase system checks for the special phases that occur (cards inside the game)
    //DO NOT MIND THE FOLLOWING CODE, it is just used as a placeholder
    run(gameData: GameData, sendData: SendData): string[] {
        
        const spiesLists:string[] = [];
        
        for (const player of gameData.players) {
            if (player.entity.alliance.toString() == "Spy" ) {
                spiesLists.push(player.username)
            }
        }


        return spiesLists

    }
}