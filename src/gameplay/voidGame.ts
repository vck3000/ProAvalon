import Game from './game';
import { Alliance } from './types';

export class VoidGame {
  game: Game;
  votesNeeded: number = 0;

  private playersVoted: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
  }

  playerVoted(username: string): void {
    this.playersVoted.add(username.toLowerCase());
    return;
  }

  getVotesNeeded(): number {
    const numResPlayers = this.game.playersInGame.filter(
      (player) => player.alliance === Alliance.Resistance,
    ).length;

    this.votesNeeded = numResPlayers + 1;

    return this.votesNeeded;
  }

  getNumVoted(): number {
    return this.playersVoted.size;
  }

  enoughVotes(): boolean {
    return this.playersVoted.size >= this.votesNeeded;
  }
}
