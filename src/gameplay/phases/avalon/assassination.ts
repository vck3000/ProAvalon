import usernamesIndexes from '../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../sockets/types';
import { Alliance } from '../../types';
import { Role } from '../../roles/types';

class Assassination implements IPhase {
  showGuns = true;

  static phase = Phase.Assassination;
  phase = Phase.Assassination;
  private room: any;
  // The role that is the owner of this phase
  role = Role.Assassin;
  finishedShot = false;

  constructor(thisRoom: any) {
    this.room = thisRoom;
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
          this.room.playersInGame,
          socket.request.user.username,
        );
        if (this.playerIndexIsAssassin(indexOfRequester)) {
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
              this.room.playersInGame,
              selectedPlayers,
            );
            // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
            // Note: Allowed to shoot Oberon
            if (
              this.room.playersInGame[indexOfTarget].alliance ===
                Alliance.Spy &&
              this.room.playersInGame[indexOfTarget].role !== Role.Oberon
            ) {
              socket.emit(
                'danger-alert',
                'You are not allowed to shoot a known spy.',
              );
              return;
            }

            // set the player shot in the assassin role object
            this.room.specialRoles[this.role].playerShot = selectedPlayers;

            if (indexOfTarget !== -1) {
              // Get merlin's username
              let merlinUsername;
              for (let i = 0; i < this.room.playersInGame.length; i++) {
                if (this.room.playersInGame[i].role === Role.Merlin) {
                  merlinUsername = this.room.playersInGame[i].username;
                }
              }

              if (this.room.playersInGame[indexOfTarget].role === Role.Merlin) {
                this.room.winner = Alliance.Spy;
                this.room.howWasWon = 'Assassinated Merlin correctly.';

                this.room.sendText(
                  `The assassin has shot ${merlinUsername}! They were correct!`,
                  'gameplay-text-red',
                );
              } else {
                this.room.winner = Alliance.Resistance;
                this.room.howWasWon =
                  'Mission successes and assassin shot wrong.';

                this.room.sendText(
                  `The assassin has shot ${selectedPlayers}! ${selectedPlayers} was not merlin, ${merlinUsername} was!`,
                  'gameplay-text-blue',
                );
              }

              this.finishedShot = true;

              // For gameRecord - get the role that was shot
              for (let i = 0; i < this.room.playersInGame.length; i++) {
                if (this.room.playersInGame[i].username === selectedPlayers) {
                  this.room.whoAssassinShot = this.room.playersInGame[i].role;
                  break;
                }
              }

              this.room.finishGame(this.room.winner);
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
              this.room.playersInGame,
              selectedPlayers[0],
            );
            const i1 = usernamesIndexes.getIndexFromUsername(
              this.room.playersInGame,
              selectedPlayers[1],
            );
            // Check the alliance of the target. If they are spy, reject it and ask them to shoot a res.
            // Note: Allowed to shoot Oberon
            if (
              this.room.playersInGame[i0].alliance === Alliance.Spy &&
              this.room.playersInGame[i0].role !== Role.Oberon
            ) {
              socket.emit(
                'danger-alert',
                'You are not allowed to shoot a known spy.',
              );
              return;
            }

            if (
              this.room.playersInGame[i1].alliance === Alliance.Spy &&
              this.room.playersInGame[i1].role !== Role.Oberon
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
            for (let i = 0; i < this.room.playersInGame.length; i++) {
              if (this.room.playersInGame[i].role === Role.Tristan) {
                tristanUsername = this.room.playersInGame[i].username;
              }
              if (this.room.playersInGame[i].role === Role.Isolde) {
                isoldeUsername = this.room.playersInGame[i].username;
              }
            }

            // set the player shot in the assassin role object
            this.room.specialRoles[this.role].playerShot = selectedPlayers[0];
            this.room.specialRoles[this.role].playerShot2 = selectedPlayers[1];

            const correctComboShot = false;
            if (
              (this.room.playersInGame[i0].role === Role.Tristan &&
                this.room.playersInGame[i1].role === Role.Isolde) ||
              (this.room.playersInGame[i1].role === Role.Tristan &&
                this.room.playersInGame[i0].role === Role.Isolde)
            ) {
              this.room.winner = Alliance.Spy;
              this.room.howWasWon =
                'Assassinated Tristan and Isolde correctly.';

              this.room.sendText(
                `The assassin has shot ${tristanUsername} and ${isoldeUsername}! They were correct!`,
                'gameplay-text-red',
              );
            } else {
              this.room.winner = Alliance.Resistance;
              this.room.howWasWon =
                'Mission successes and assassin shot wrong.';

              // console.log("THIS WAS RUN ONCE");
              this.room.sendText(
                `The assassin has shot ${selectedPlayers[0]} and ${selectedPlayers[1]}! ${selectedPlayers[0]} and ${selectedPlayers[1]} were not Tristan and Isolde, ${tristanUsername} and ${isoldeUsername} were!`,
                'gameplay-text-blue',
              );
            }

            this.finishedShot = true;

            // console.log("playersInGame");
            // For gameRecord - get the role that was shot
            for (let i = 0; i < this.room.playersInGame.length; i++) {
              // console.log(this.thisRoom.playersInGame[i].username + " is " + this.thisRoom.playersInGame[i].role);
              // console.log("data0: " + data[0]);
              // console.log("data1: " + data[1]);

              if (this.room.playersInGame[i].username === selectedPlayers[0]) {
                this.room.whoAssassinShot = this.room.playersInGame[i].role;
              }

              if (this.room.playersInGame[i].username === selectedPlayers[1]) {
                this.room.whoAssassinShot2 = this.room.playersInGame[i].role;
              }
            }

            this.room.finishGame(this.room.winner);
          }
        }
      }
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // Get the index of the assassin
    let indexOfAssassin = -1;
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.playerIndexIsAssassin(i)) {
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
      if (this.playerIndexIsAssassin(indexOfPlayer)) {
        // Check if Merlin exists.
        let merlinExists = false;
        // Check if iso tristan are both in the game.
        let tristExists = false;
        let isoExists = false;

        for (let i = 0; i < this.room.playersInGame.length; i++) {
          if (this.room.playersInGame[i].role === Role.Merlin) {
            merlinExists = true;
          }

          if (this.room.playersInGame[i].role === Role.Tristan) {
            tristExists = true;
          }

          if (this.room.playersInGame[i].role === Role.Isolde) {
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
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.playerIndexIsAssassin(i)) {
        indexOfAssassin = i;
      }
    }

    if (indexOfPlayer === indexOfAssassin) {
      return 'Choose someone to assassinate.';
    }
    // If it is any other player who isn't special role

    const usernameOfAssassin =
      this.room.playersInGame[indexOfAssassin].username;
    return `Waiting for ${usernameOfAssassin} to assassinate.`;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    const spyIndexes = [];

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (
        this.room.playersInGame[i].alliance === Alliance.Spy &&
        this.room.playersInGame[i].role !== Role.Oberon
      ) {
        spyIndexes.push(i);
      }
    }

    return spyIndexes;
  }

  private playerIndexIsAssassin(index: number): boolean {
    return (
      this.room.playersInGame[index].role === this.role ||
      // Absolutely terrible, but easiest for now. Need ECS to fix this, or make this a delegate/override function.
      this.room.playersInGame[index].role === Role.MordredAssassin
    );
  }
}

export default Assassination;
