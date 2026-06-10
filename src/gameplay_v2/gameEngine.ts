import { Player } from './player';
import { IState } from './states/state';
import { VotingTeam } from './states/baseStates/votingTeam';
import Merlin from './roles/merlin';
import { Vote, VoteC } from './roles/components/vote';
import { System } from './systems/system';
import { VoteS } from './systems/voteS';
import { GameMoveData } from './gameTypes';

export class GameData {
  players: Player[];
  state: IState;
}

export class GameEngine {
  data: GameData;
  systems: System[] = [new VoteS()];

  constructor() {
    this.data = {
      players: [
        new Player('1', new Merlin()),
        new Player('2', new Merlin()),
        new Player('3', new Merlin()),
        new Player('4', new Merlin()),
        new Player('5', new Merlin()),
      ],
      state: VotingTeam,
    };
  }

  gameMove(username: string, gameMoveData: GameMoveData): void {
    // Injecting the user votes
    if (gameMoveData.type === 'voteTeam') {
      const vote: Vote = gameMoveData.data;

      const player = this.data.players.filter(
        (player) => player.username === username,
      )[0];

      const voteComponents: VoteC[] = player.entity.components.filter(
        (component) => component.name === 'Vote',
      );

      for (const vComponent of voteComponents) {
        vComponent.data.vote = vote;
      }
    }

    this.runAllSystems();
  }

  runAllSystems(): void {
    for (const system of this.systems) {
      system.run(this.data, () => {});
    }
  }
}
