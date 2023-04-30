import { SendData, System } from './system';
import { GameData } from '../gameEngine';
import { Vote, VoteC } from '../roles/components/vote';
import { VotingMission } from '../states/baseStates/VotingMission';

export class VoteS implements System {
  run(gameData: GameData, sendData: SendData): void {
    // See if we have all the votes
    const playersComponents = [];
    for (const player of gameData.players) {
      playersComponents.push(player.entity.components);
    }
    
    //counts the number of players
    let numberOfPlayers = 0;
    for(const playerComponents of playersComponents){
      if(playerComponents != null){
        numberOfPlayers++;
      }
    }

    //pushes all vote components into the array
    const voteComponents: VoteC[] = [];
    for (const playerComponents of playersComponents) {
      for (const component of playerComponents) {
        if (component.name === 'Vote') {
          voteComponents.push(component);
        }
      }
    }

    //counts all of the number of votes that aren't null
    let numberOfVotesIn = 0;
    for (const voteC of voteComponents) {
      if (voteC.data.vote !== Vote.Null) {
        numberOfVotesIn++;
      }
    }

    // Stop here if we don't have all the votes in yet.
    if (numberOfVotesIn !== voteComponents.length) {
      return;
    }

    //checks if majority approves
    let numberOfVotesApprove = 0;
    for(const voteC of voteComponents){
      if(voteC.data.vote === Vote.Approve){
        numberOfVotesApprove++;
      }
    }

    //checks if majority approves the mission
    if(numberOfVotesApprove > (numberOfPlayers / 2)){
      //changes to another state of the game
      gameData.state = new VotingMission();
    }

    // Clear vote data from players
    for (const voteC of voteComponents) {
      voteC.data.vote = Vote.Null;
    }

    // Send out data?
    // Yes.

    // TODO Consider wrapping whether to transition into a function or not
  }
}
