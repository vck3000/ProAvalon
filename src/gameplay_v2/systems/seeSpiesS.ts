import { GameData } from '../gameEngine';
import { SeeSpiesC } from '../roles/components/seeSpies';
import { SeeSpiesState } from '../states/baseStates/seeSpiesState';
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

        // const currentSeeSpieC: SeeSpiesC = {
        //     name: 'current spies list',
        //     data: {spiesLists}
        // }

        return spiesLists

    }
    
}