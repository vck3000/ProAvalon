import { GameData } from '../gameEngine';
import { SendData, System } from './system';
import { Leader } from '../roles/components/leader';
import { Player } from '../player';

export class LeaderSelectionS implements System {
    run(gameData: GameData, sendData: SendData): Player[] {
        
        const noLeaderLists:Player[] = [];
        const playerList:Player[] = gameData.players;
        let newLeaderinPlayerList:Player[] = [];
        let currentLeader:string;
        let leaderPosition = 0;

        for (const player of playerList) {
            
            // find the current leader
            if (player.entity.components.find((component) => component.name === "leader") ) {
                currentLeader = player.username;
                break;
            }
            leaderPosition++;
            noLeaderLists.push(player);

        }
        // if the leader is not set
        if (currentLeader == null) {
            playerList[0].entity.components.push(new Leader());

            return playerList;
        }

        newLeaderinPlayerList = this.changeLeader(currentLeader, leaderPosition, playerList);
   

        return newLeaderinPlayerList;

    }

    // swith leader to the next player    
    changeLeader(username: string, leaderPosition:number, playerList: Player[]): Player[] {
        let theNextLeaderPosition = 0;
        let leaderComponentPosition = 0;
        // remove current leader component
        for (const component of playerList[leaderPosition].entity.components) {
            if (component.name == "leader" ){
                playerList[leaderPosition].entity.components.splice(leaderComponentPosition, 1);
            }
            leaderComponentPosition++;

            // console.log(playerList[leaderPosition].entity.components)
        }
        
        if (leaderPosition < playerList.length-1) {
            theNextLeaderPosition = leaderPosition + 1

            // add leader component
            playerList[theNextLeaderPosition].entity.components.push(new Leader());
           
        }

        else if (leaderPosition = playerList.length -1) {
            // add leader component to the first player, initialize the sequence
            playerList[0].entity.components.push(new Leader());
        }
        console.log(playerList);
        return playerList;
      }


    


    
}

