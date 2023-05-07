import { SendData, System } from './system';
import { GameData } from '../gameEngine';
import { Vote, VoteC } from '../roles/components/vote';
import { VotingMission } from '../states/baseStates/VotingMission';

export class VoteS implements System {
  run(gameData: GameData, sendData: SendData): void {
    const voteComponents = gameData.players.map((player) =>
      player.entity.getComponent(VoteC.nameC),
    );

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
    for (const voteC of voteComponents) {
      if (voteC.data.vote === Vote.Approve) {
        numberOfVotesApprove++;
      }
    }

    //checks if majority approves the mission
    if (numberOfVotesApprove > voteComponents.length / 2) {
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
