import Game from './game';
import { Alliance } from './types';

export class VoidGameTracker {
  private game: Game;
  private playersVoted: Set<string> = new Set();

  constructor(game: Game) {
    this.game = game;
  }

  // Returns true if the game should now be voided
  playerVoted(username: string): boolean {
    if (!this.game.gameStarted) {
      return false;
    }

    const numResPlayers = this.game.playersInGame.filter(
      (player) => player.alliance === Alliance.Resistance,
    ).length;

    const votesNeeded = numResPlayers + 1;

    this.playersVoted.add(username.toLowerCase());

    this.game.sendText(
      `${this.playersVoted.size} / ${votesNeeded} players have voted to void the game.`,
      'server-text',
    );

    return this.playersVoted.size >= votesNeeded;
  }
}
