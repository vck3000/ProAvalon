import { ButtonSettings, isGamePhase } from './phases';
import Game, { getRandomInt } from './game';
import { postGameMoveChecks } from '../sockets/sockets';

// All in milliseconds
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;

const TWENTY_SECONDS = 20 * ONE_SECOND;
const TWO_SECONDS = 2 * ONE_SECOND;
const THREE_MINUTES = 3 * ONE_MINUTE;

export class GameTimer {
  getTimeFunc: () => Date;
  dateTimerExpires: Date = new Date(0); // Is updated after each changePhase.
  timerDuration: number = TWO_SECONDS; // Config. Never changed after construction.
  game: Game;

  timeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  constructor(game: Game, getTimeFunc: () => Date) {
    this.game = game;
    this.getTimeFunc = getTimeFunc;
  }

  destructor() {
    this.clearTimers();
  }

  private clearTimers() {
    this.dateTimerExpires = new Date(0);

    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();
  }

  // Returns the new date for timer expiry
  resetTimer(): Date {
    return;

    // Clear existing timers
    this.clearTimers();

    // Don't start timer if it's not a game phase.
    if (!isGamePhase(this.game.phase)) {
      return this.dateTimerExpires;
    }

    // Don't start timer if game is finished.
    if (this.game.finished) {
      return this.dateTimerExpires;
    }

    this.dateTimerExpires = new Date(
      this.getTimeFunc().getTime() + this.timerDuration,
    );

    const timeoutId = setTimeout(() => {
      this.callback();
      this.timeouts.delete(timeoutId);
    }, this.timerDuration + ONE_SECOND);

    this.timeouts.add(timeoutId);

    return this.dateTimerExpires;
  }

  private callback() {
    // Ignore if dateTimerExpires isn't set
    if (this.dateTimerExpires === new Date(0)) {
      return;
    }

    // Ignore if date timer expires is still ahead of now
    if (this.dateTimerExpires > this.getTimeFunc()) {
      return;
    }

    // User has timed out.
    // Get the current phase
    let phaseObject;
    // eslint-disable-next-line no-prototype-builtins
    if (this.game.commonPhases.hasOwnProperty(this.game.phase) === true) {
      phaseObject = this.game.commonPhases[this.game.phase];
    } else if (
      // eslint-disable-next-line no-prototype-builtins
      this.game.specialPhases.hasOwnProperty(this.game.phase) === true
    ) {
      phaseObject = this.game.specialPhases[this.game.phase];
    }

    // Iterate over each user to figure out who hasn't acted.
    for (let i = 0; i < this.game.playersInGame.length; i++) {
      const buttonSettings: ButtonSettings = phaseObject.buttonSettings(i);
      const numOfTargets: number | number[] = phaseObject.numOfTargets(i);
      const prohibitedIndexesToPick: number[] =
        phaseObject.getProhibitedIndexesToPick(i);

      const buttonsAvailable: string[] = [];
      if (buttonSettings.red.hidden === false) {
        buttonsAvailable.push('no');
      }

      if (buttonSettings.green.hidden === false) {
        buttonsAvailable.push('yes');
      }

      // If either button is available to press, they've timed out.
      const timedOut = buttonsAvailable.length !== 0;

      if (timedOut) {
        // Select a random option for them.
        const randomButton =
          buttonsAvailable[getRandomInt(0, buttonsAvailable.length)];

        // Need to identify any targets to select too.
        const targets: string[] = [];

        const filteredPlayerUsernames = [];
        for (let i = 0; i < this.game.playersInGame.length; i++) {
          if (!prohibitedIndexesToPick.includes(i)) {
            filteredPlayerUsernames.push(
              this.game.playersInGame[i].request.user.username,
            );
          }
        }

        while (numOfTargets > targets.length) {
          const randomNum = getRandomInt(0, filteredPlayerUsernames.length);
          targets.push(filteredPlayerUsernames[randomNum]);
          filteredPlayerUsernames.splice(randomNum, 1);
        }

        // Notify everyone
        this.game.sendText(
          this.game.allSockets,
          `${this.game.playersInGame[i].request.user.username} has timed out. Forcing a random move.`,
          'server-text',
        );
        console.log(
          `Player: ${this.game.playersInGame[i].request.user.username} | Button: ${randomButton} | Targets: ${targets}.`,
        );

        // Act on the randomised action.
        const socketsOfPlayer = this.game.socketsOfPlayers.filter(
          (socket) =>
            socket.request.user.username.toLowerCase() ===
            this.game.playersInGame[i].request.user.username.toLowerCase(),
        );
        if (socketsOfPlayer.length !== 1) {
          return;
        }
        this.game.gameMove(socketsOfPlayer[0], [randomButton, targets]);

        // Don't continue iterating if phase has changed, otherwise we get funny behavior in between phases
        // where someone's next move will be auto made.
        if (phaseObject.phase !== this.game.phase) {
          break;
        }
      }
    }

    postGameMoveChecks(this.game);
  }
}
