import Game from './game';

export class VoidGame {
  game: Game;

  private playersVotedVoid: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
  }

  voteVoidGame(username: string, votesNeeded: number): number {
    this.playersVotedVoid.add(username.toLowerCase());
    return this.playersVotedVoid.size;
  }
}
