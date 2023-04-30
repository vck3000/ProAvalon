import { SendData, System } from './system';
import { GameData } from '../gameEngine';
import { Mission, MissionC } from '../roles/components/mission';

//class is used to check for the decision made by each players that were selected into the mission
export class voteMissionS implements System {
  run(gameData: GameData, sendData: SendData): void {
      // initialize all components inside the player
      const playersComponents = gameData.players.map((player) => player.entity.components);
 
      let numberOfPlayers = 0;
      for(const playerComponents of playersComponents){
        if(playerComponents != null){
          numberOfPlayers++;
        }
      }

      //pushes all vote components into the array
      const missionComponents: MissionC[] = [];
      for (const playerComponents of playersComponents) {
        for (const component of playerComponents) {
          if (component.name === 'Mission') {
            missionComponents.push(component);
          }
        }
      }

      //counts all of the number of votes that aren't null
      let numberOfVotesIn = 0;
      for (const voteC of missionComponents) {
        if (voteC.data.mission !== Mission.Null) {
          numberOfVotesIn++;
        }
      }

      // Stop here if we don't have all the votes in yet.
      if (numberOfVotesIn !== missionComponents.length) {
        return;
      }

      //checks if majority supports the mission
      let numberOfSupport = 0;
      for(const voteC of missionComponents){
        if(voteC.data.mission === Mission.Support){
          numberOfSupport++;
        }
      }

      //checks if majority approves the mission
      if(numberOfSupport > (numberOfPlayers / 2)){
        //decides on the eng result of the mission
      }

      // Clear vote data from players
      for (const voteC of missionComponents) {
        voteC.data.mission = Mission.Null;
      }
  }
}
