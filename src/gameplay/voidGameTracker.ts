import Game from './game';
import { Alliance } from './types';

export class VoidGameTracker {
  game: Game;
  votesNeeded: number = 0;

  private playersVoted: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
  }

  // Adds player to playersVoted set
  // Returns true if numPlayersVoted > votesNeeded
  playerVoted(username: string): boolean {
    const numResPlayers = this.game.playersInGame.filter(
      (player) => player.alliance === Alliance.Resistance,
    ).length;

    this.votesNeeded = numResPlayers + 1;

    this.playersVoted.add(username.toLowerCase());

    const s = this.playersVoted.size > 1 ? 's have' : ' has';

    this.game.sendText(
      `${this.playersVoted.size} player${s} voted to void the game. ${this.votesNeeded} votes needed.`,
      'server-text',
    );

    return this.playersVoted.size >= this.votesNeeded;
  }
}
