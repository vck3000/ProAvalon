//this phase will assign all players with random roles and send them back as gameData and sendData
import { GameData } from '../gameEngine';
import { SendData, System } from './system';
import { Player } from '../player';

//An algorithm where every players are assign with different roles
//An algorithm where a player will be given leader

export class InitialPhaseS implements System {
    run(gameData: GameData, sendData: SendData): void {

        const playerList:Player[] = gameData.players;

        


    }
}