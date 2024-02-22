import usernamesIndexes from '../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../sockets/types';
import { Alliance } from '../../types';
import Assassin from '../../roles/avalon/assassin';

class Assassination implements IPhase {
  showGuns = true;

  static phase = Phase.assassination;
  phase = Phase.assassination;
  private thisRoom: any;
  // The role that is the owner of this phase
  private role = 'Assassin';
  finishedShot = false;

  constructor(thisRoom: any) {
    this.thisRoom = thisRoom;
  }

  gameMove(
    socket: SocketUser,
    buttonPressed: string,
    selectedPlayers: string[],
  ): void {
    if (buttonPressed !== 'yes') {
      // this.thisRoom.sendText(this.thisRoom.allSockets, `Button pressed was ${buttonPressed}. Let admin know if you see this.`, "gameplay-text");
      return;
    }

    if (this.finishedShot === false) {
      // Carry out the assassination move
      if (socket && selectedPlayers) {
        // Check that the person making this request is the assassin
        const indexOfRequester = usernamesIndexes.getIndexFromUsername(
          this.thisRoom.playersInGame,
          socket.request.user.username,
        );
        if (this.thisRoom.playersInGame[indexOfRequester].role === this.role) {
          // Just shoot Merlin
          if (selectedPlayers.length === 1) {
            if (
              typeof selectedPlayers === 'object' ||
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              typeof selectedPlayers === 'array'
            ) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              selectedPlayers = selectedPlayers[0];
            }

            const indexOfTarget = usernamesIndexes.getIndexFromUsername(
              this.thisRoom.playersInGame,
              selectedPlayers,
            );
            // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
            // Note: Allowed to shoot Oberon
            if (
              this.thisRoom.playersInGame[indexOfTarget].alliance ===
                Alliance.Spy &&
              this.thisRoom.playersInGame[indexOfTarget].role !== 'Oberon'
            ) {
              socket.emit(
                'danger-alert',
                'You are not allowed to shoot a known spy.',
              );
              return;
            }

            // set the player shot in the assassin role object
            this.thisRoom.specialRoles[Assassin.role].playerShot =
              selectedPlayers;

            if (indexOfTarget !== -1) {
              // Get merlin's username
              let merlinUsername;
              for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (this.thisRoom.playersInGame[i].role === 'Merlin') {
                  merlinUsername = this.thisRoom.playersInGame[i].username;
                }
              }

              if (
                this.thisRoom.playersInGame[indexOfTarget].role === 'Merlin'
              ) {
                this.thisRoom.winner = Alliance.Spy;
                this.thisRoom.howWasWon = 'Assassinated Merlin correctly.';

                this.thisRoom.sendText(
                  `The assassin has shot ${merlinUsername}! They were correct!`,
                  'gameplay-text-red',
                );
              } else {
                this.thisRoom.winner = Alliance.Resistance;
                this.thisRoom.howWasWon =
                  'Mission successes and assassin shot wrong.';

                this.thisRoom.sendText(
                  `The assassin has shot ${selectedPlayers}! ${selectedPlayers} was not merlin, ${merlinUsername} was!`,
                  'gameplay-text-blue',
                );
              }

              this.finishedShot = true;

              // For gameRecord - get the role that was shot
              for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
                if (
                  this.thisRoom.playersInGame[i].username === selectedPlayers
                ) {
                  this.thisRoom.whoAssassinShot =
                    this.thisRoom.playersInGame[i].role;
                  break;
                }
              }

              this.thisRoom.finishGame(this.thisRoom.winner);
            } else {
              console.log(selectedPlayers);
              socket.emit(
                'danger-alert',
                'Bad assassination data. Tell the admin if you see this!',
              );
            }
          }

          // Only shoot Tristan and Isolde together
          else if (selectedPlayers.length === 2) {
            const i0 = usernamesIndexes.getIndexFromUsername(
              this.thisRoom.playersInGame,
              selectedPlayers[0],
            );
            const i1 = usernamesIndexes.getIndexFromUsername(
              this.thisRoom.playersInGame,
              selectedPlayers[1],
            );
            // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
            // Note: Allowed to shoot Oberon
            if (
              this.thisRoom.playersInGame[i0].alliance === Alliance.Spy &&
              this.thisRoom.playersInGame[i0].role !== 'Oberon'
            ) {
              socket.emit(
                'danger-alert',
                'You are not allowed to shoot a known spy.',
              );
              return;
            }

            if (
              this.thisRoom.playersInGame[i1].alliance === Alliance.Spy &&
              this.thisRoom.playersInGame[i1].role !== 'Oberon'
            ) {
              socket.emit(
                'danger-alert',
                'You are not allowed to shoot a known spy.',
              );
              return;
            }

            // Get tristan's username
            // Get isolde's username
            let tristanUsername = '';
            let isoldeUsername = '';
            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
              if (this.thisRoom.playersInGame[i].role === 'Tristan') {
                tristanUsername = this.thisRoom.playersInGame[i].username;
              }
              if (this.thisRoom.playersInGame[i].role === 'Isolde') {
                isoldeUsername = this.thisRoom.playersInGame[i].username;
              }
            }

            // set the player shot in the assassin role object
            this.thisRoom.specialRoles.assassin.playerShot = selectedPlayers[0];
            this.thisRoom.specialRoles.assassin.playerShot2 =
              selectedPlayers[1];

            const correctComboShot = false;
            if (
              (this.thisRoom.playersInGame[i0].role === 'Tristan' &&
                this.thisRoom.playersInGame[i1].role === 'Isolde') ||
              (this.thisRoom.playersInGame[i1].role === 'Tristan' &&
                this.thisRoom.playersInGame[i0].role === 'Isolde')
            ) {
              this.thisRoom.winner = Alliance.Spy;
              this.thisRoom.howWasWon =
                'Assassinated Tristan and Isolde correctly.';

              this.thisRoom.sendText(
                `The assassin has shot ${tristanUsername} and ${isoldeUsername}! They were correct!`,
                'gameplay-text-red',
              );
            } else {
              this.thisRoom.winner = Alliance.Resistance;
              this.thisRoom.howWasWon =
                'Mission successes and assassin shot wrong.';

              // console.log("THIS WAS RUN ONCE");
              this.thisRoom.sendText(
                `The assassin has shot ${selectedPlayers[0]} and ${selectedPlayers[1]}! ${selectedPlayers[0]} and ${selectedPlayers[1]} were not Tristan and Isolde, ${tristanUsername} and ${isoldeUsername} were!`,
                'gameplay-text-blue',
              );
            }

            this.finishedShot = true;

            // console.log("playersInGame");
            // For gameRecord - get the role that was shot
            for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
              // console.log(this.thisRoom.playersInGame[i].username + " is " + this.thisRoom.playersInGame[i].role);
              // console.log("data0: " + data[0]);
              // console.log("data1: " + data[1]);

              if (
                this.thisRoom.playersInGame[i].username === selectedPlayers[0]
              ) {
                this.thisRoom.whoAssassinShot =
                  this.thisRoom.playersInGame[i].role;
              }

              if (
                this.thisRoom.playersInGame[i].username === selectedPlayers[1]
              ) {
                this.thisRoom.whoAssassinShot2 =
                  this.thisRoom.playersInGame[i].role;
              }
            }

            this.thisRoom.finishGame(this.thisRoom.winner);
          }
        }
      }
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // Get the index of the assassin
    let indexOfAssassin = -1;
    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === this.role) {
        indexOfAssassin = i;
        break;
      }
    }

    if (indexOfPlayer === indexOfAssassin) {
      return {
        green: {
          hidden: false,
          disabled: true,
          setText: 'Shoot',
        },
        red: {
          hidden: true,
          disabled: true,
          setText: '',
        },
      };
    }

    // If it is any other player who isn't special role
    return {
      green: {
        hidden: true,
        disabled: true,
        setText: '',
      },
      red: {
        hidden: true,
        disabled: true,
        setText: '',
      },
    };
  }

  numOfTargets(indexOfPlayer: number): number | number[] {
    if (indexOfPlayer !== undefined && indexOfPlayer !== null) {
      // If assassin, one player to select (assassinate)
      if (this.thisRoom.playersInGame[indexOfPlayer].role === this.role) {
        // Check if Merlin exists.
        let merlinExists = false;
        // Check if iso tristan are both in the game.
        let tristExists = false;
        let isoExists = false;

        for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
          if (this.thisRoom.playersInGame[i].role === 'Merlin') {
            merlinExists = true;
          }

          if (this.thisRoom.playersInGame[i].role === 'Tristan') {
            tristExists = true;
          }

          if (this.thisRoom.playersInGame[i].role === 'Isolde') {
            isoExists = true;
          }
        }

        if (tristExists === true && isoExists === true && merlinExists) {
          return [1, 2];
        }
        if (tristExists === true && isoExists === true) {
          return 2;
        }
        if (merlinExists === true) {
          return 1;
        }
      } else {
        return null;
      }
    }
  }

  getStatusMessage(indexOfPlayer: number): string {
    // Get the index of the assassin
    let indexOfAssassin = -1;
    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].role === this.role) {
        indexOfAssassin = i;
      }
    }

    if (indexOfPlayer === indexOfAssassin) {
      return 'Choose someone to assassinate.';
    }
    // If it is any other player who isn't special role

    const usernameOfAssassin =
      this.thisRoom.playersInGame[indexOfAssassin].username;
    return `Waiting for ${usernameOfAssassin} to assassinate.`;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    const spyIndexes = [];

    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (
        this.thisRoom.playersInGame[i].alliance === Alliance.Spy &&
        this.thisRoom.playersInGame[i].role !== 'Oberon'
      ) {
        spyIndexes.push(i);
      }
    }

    return spyIndexes;
  }
}

export default Assassination;
