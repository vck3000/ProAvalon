import { Player } from './player';
import { IState } from './states/state';
import { VotingTeam } from './states/baseStates/votingTeam';
import Merlin from './roles/merlin';
import { Vote, VoteC } from './roles/components/vote';
import { System } from './systems/system';
import { VoteS } from './systems/voteS';

// 14/5 added by mengchen:  when adding player to contructor as paramter of Player changes,
// Input here also need to change, so we need to add Role and Alliance here
import { GameMoveData, Role, Alliance } from './gameTypes';

export class GameData {
  players: Player[];
  state: IState;
}

export class GameEngine {
  data: GameData;
  systems: System[] = [new VoteS()];

  constructor() {

    // Note here the data input has been changed as player.ts changed correspondly.
    this.data = {
      players: [
        new Player('1', Alliance.Resistance, Role.Merlin),
        new Player('2', Alliance.Spy, Role.Spy),
        new Player('3', Alliance.Spy, Role.Assassin),
        new Player('4', Alliance.Resistance, Role.Resistance),
        new Player('5', Alliance.Resistance, Role.Resistance),
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
      system.run(this.data, () => { });
    }
  }
}
