//this phase will assign all players with random roles and send them back as gameData and sendData
import { GameData } from '../gameEngine';
import { SendData, System } from './system';
import { Player } from '../player';
import Entity from '../roles/entity';
import Merlin from '../roles/merlin';
import Mordred from '../roles/mordred';
import Morgana from '../roles/morgana';
import Oberon from '../roles/oberon';
import Percival from '../roles/percival';
import Resistance from '../roles/resistance';
import Assassin from '../roles/assassin';

//An algorithm where every players are assign with different roles
//An algorithm where a player will be given leader
const fivePeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 1,
  };

  const sixPeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 2,
  };

  const sevenPeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 2,
    oberon: 1,
  };

  const eightPeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 3,
    oberon: 1,
  };

  const nightPeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 4,
    mordred: 1,
  };

  const tenPeopleJobList: Record<string, number> = {
    merlin: 1,
    morgana: 1,
    percival: 1,
    assassin: 1,
    resistance: 4,
    oberon: 1,
    mordred: 1,
  };

export class InitialPhaseS implements System {
    run(gameData: GameData, sendData: SendData): void {

        const playerList:Player[] = gameData.players;
        const playerNums: Number = playerList.length;
        // shuffle the old playerList, create new sequence
        const newPlayerList = this.shuffleArray(playerList);

        let jobList: Record<string, number> = {};

        // assign roles to players based on the number of players
        switch (playerNums){
            case 5:{
                jobList = fivePeopleJobList;
            }
            case 6:{
                jobList = sixPeopleJobList;
            }
            case 7:{
                jobList = sevenPeopleJobList;
            }
            case 8:{
                jobList = eightPeopleJobList;
            }
            case 9:{
                jobList = nightPeopleJobList;
            }
            case 10:{
                jobList = tenPeopleJobList;
            }

        }

        for (let player of newPlayerList) {
            player = this.assignJobToPlayer(player, jobList)

        }


    }
    
    // random num function
    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    assignNonResistanceJob(currentPlayer: Player, jobList: Record<string, number>): Player {
        // assign roles excpet resistance to players
        const nonResistanceJobs = Object.keys(jobList).filter(job => job !== "resistance" && jobList[job] > 0);
        const randomIndex = this.getRandomInt(0, nonResistanceJobs.length - 1);
        const job = nonResistanceJobs[randomIndex] as string;
        jobList[job] -= 1;
        switch (job) {
            case "merlin": {
                currentPlayer.entity = new Merlin;
            }
            case "morgana": {
                currentPlayer.entity = new Morgana;
            }
            case "mordred": {
                currentPlayer.entity = new Mordred
            }
            case "percival": {
                currentPlayer.entity = new Percival;
            }
            case "Oberon": {
                currentPlayer.entity = new Oberon;
            }
            case "assassin": {
                currentPlayer.entity = new Assassin;
            }
        }
        
        return currentPlayer;
      }
    
    assignResistanceJob(currentPlayer: Player): Player {
        currentPlayer.entity = new Resistance; // 为该玩家分配“平民”职业 assigning resistance to the player
        return currentPlayer;
      }

    assignJobToPlayer(currentPlayer: Player, jobList:Record<string, number>) {
        if (currentPlayer.entity !== null) {
            return; // 如果玩家已经有职业，不再分配 if the player has role, just return
        }
      
        if (Object.values(jobList).every(count => count === 0)) {
            // 如果所有职业都已分配完，为该玩家分配“平民”职业 if all rolses have been assigned, assign resistance
            currentPlayer.entity = new Resistance; 
            return;
        }
      
        const playerWithRole = jobList.resistance > 0 ? this.assignResistanceJob(currentPlayer) : 
             this.assignNonResistanceJob(currentPlayer, jobList);
        
        return playerWithRole;
      }

    shuffleArray(array: Player[]) {
        // 生成随机权重并将它们与数组元素关联
        const weightedArray = array.map((item) => ({ item, weight: Math.random() }));
      
        // 按照权重排序并返回元素
        return weightedArray
          .sort((a, b) => a.weight - b.weight)
          .map((weightedItem) => weightedItem.item);
      }
}