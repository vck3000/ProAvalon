import { SendData, System } from './system';
import { GameData } from '../gameEngine';
import { Vote, VoteC } from '../roles/components/vote';
import { VotingMission } from '../states/baseStates/votingMission';

export class VoteS implements System {
  run(gameData: GameData, sendData: SendData): void {
    // See if we have all the votes
    const playersComponents = [];
    for (const player of gameData.players) {
      playersComponents.push(player.entity.components);
    }
    // Functional style programming
    // const playersComponents = gameData.players.map((player) => player.entity.components);

    const voteComponents: VoteC[] = [];
    for (const playerComponents of playersComponents) {
      for (const component of playerComponents) {
        if (component.name === 'Vote') {
          voteComponents.push(component);
        }
      }
    }

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

    // TODO Check if there is majority approve

    // Transition phase
    gameData.state = new VotingMission();

    // Clear vote data from players
    for (const voteC of voteComponents) {
      voteC.data.vote = Vote.Null;
    }

    // Send out data?
    // Yes.

    // TODO Consider wrapping whether to transition into a function or not
  }
}
