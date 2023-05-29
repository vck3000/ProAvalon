import { GameData } from '../gameEngine';
import { SendData, System } from './system';

export class SeeSpiesS implements System {
    run(gameData: GameData, sendData: SendData): string[] {
        
        const spiesLists:string[] = [];
        
        for (const player of gameData.players) {
            // see if the player is spy
            // ** Mordred is not finished
            if (player.entity.alliance.toString() == "Spy" ) {
                spiesLists.push(player.username)
            }
        }


        return spiesLists

    }
    
}