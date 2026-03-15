import usernamesIndexes from '../../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';
import { Alliance } from '../../types';
import { Role } from '../../roles/types';

class Sniping implements IPhase {
  showGuns = true;

  static phase = Phase.Sniping;
  phase = Phase.Sniping;
  private room: any;
  // The role that is the owner of this phase
  role = Role.Sniper;
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
      return;
    }

    if (this.finishedShot === false) {
      // Carry out the sniping move
      if (socket && selectedPlayers) {
        // Check that the person making this request is the sniper
        const indexOfRequester = usernamesIndexes.getIndexFromUsername(
          this.room.playersInGame,
          socket.request.user.username,
        );
        if (
          this.room.playersInGame[indexOfRequester].role === this.role
        ) {

          const selectedPlayer = selectedPlayers.length === 1 ? selectedPlayers[0] : null;

          // set the player shot in the sniper role object
          this.room.specialRoles[this.role].playerShot = selectedPlayer;

          if (selectedPlayer) {
            const indexOfTarget = usernamesIndexes.getIndexFromUsername(
              this.room.playersInGame,
              selectedPlayer,
            );

            const {
              username: targetUsername,
              role: targetRole
            } = this.room.playersInGame[indexOfTarget];

            if (targetRole === Role.Assassin) {
              this.room.specialRoles[Role.Sniper].shotCorrectly = true;
              this.room.winner = Alliance.Resistance;
              this.room.howWasWon = 'Sniped assassin correctly.';

              this.room.sendText(
                `The sniper has shot ${targetUsername}! They were correct!`,
                'gameplay-text-blue',
              );


              // For gameRecord - get the role that was shot
              for (let i = 0; i < this.room.playersInGame.length; i++) {
                if (this.room.playersInGame[i].username === selectedPlayers) {
                  this.room.whoSniperShot = this.room.playersInGame[i].role;
                  break;
                }
              }


              this.room.finishGame(this.room.winner);
            } else {
              // Move on to the assassination phase
              this.room.changePhase(Phase.Assassination);
            }

            this.finishedShot = true;

          } else {
            console.log(selectedPlayers);
            socket.emit(
              'danger-alert',
              'Bad sniping data. Tell the admin if you see this!',
            );
          }

        }
      }
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // Get the index of the sniper
    let indexOfSniper = -1;
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === this.role) {
        indexOfSniper = i;
        break;
      }
    }

    if (indexOfPlayer === indexOfSniper) {
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
      if (this.room.playersInGame[indexOfPlayer].role === this.role) {
        // If sniper, one player to select
        return 1;
      } else {
        return null;
      }
    }
  }

  getStatusMessage(indexOfPlayer: number): string {
    // Get the index of the assassin
    let indexOfSniper = -1;
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === this.role) {
        indexOfSniper = i;
      }
    }

    if (indexOfPlayer === indexOfSniper) {
      return 'Choose someone to snipe.';
    }

    return `Waiting for sniper to snipe.`;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }

  handleTimeout(): void {
    this.room.sendText(
      'Sniper ran out of time. Moving to assassination phase.',
      'server-text',
    );
    this.room.changePhase(Phase.Assassination);
  }
}


export default Sniping;