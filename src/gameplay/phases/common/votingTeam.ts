import usernamesIndexes from '../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { Alliance } from '../../types';
import { SocketUser } from '../../../sockets/types';

class VotingTeam implements IPhase {
  static phase = Phase.VotingTeam;
  phase = Phase.VotingTeam;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(
    socket: SocketUser,
    buttonPressed: string,
    selectedPlayers: string[],
  ): void {
    // Get the index of the user who is trying to vote
    const i = this.thisRoom.playersYetToVote.indexOf(
      socket.request.user.username,
    );

    // Check the data is valid (if it is not a "yes" or a "no")
    if (!(buttonPressed === 'yes' || buttonPressed === 'no')) {
      return;
    }

    // If they haven't voted yet
    if (i !== -1) {
      if (buttonPressed === 'yes') {
        this.thisRoom.votes[
          usernamesIndexes.getIndexFromUsername(
            this.thisRoom.playersInGame,
            socket.request.user.username,
          )
        ] = 'approve';
      } else if (buttonPressed === 'no') {
        this.thisRoom.votes[
          usernamesIndexes.getIndexFromUsername(
            this.thisRoom.playersInGame,
            socket.request.user.username,
          )
        ] = 'reject';
      } else {
        console.log(
          'ERROR! this.thisRoom should definitely not happen. Game.js votingTeam.',
        );
      }

      // remove the player from players yet to vote
      this.thisRoom.playersYetToVote.splice(i, 1);

      // If we have all of our votes, proceed onward
      if (this.thisRoom.playersYetToVote.length === 0) {
        this.thisRoom.publicVotes = this.thisRoom.votes;
        this.thisRoom.VHUpdateTeamVotes();

        const outcome = this.calcVotes(this.thisRoom.votes);

        if (outcome === 'yes') {
          this.thisRoom.changePhase(Phase.VotingMission);
          this.thisRoom.playersYetToVote = this.thisRoom.proposedTeam.slice();

          const str = `Mission ${this.thisRoom.missionNum}.${
            this.thisRoom.pickNum
          } was approved.${this.getStrApprovedRejectedPlayers(
            this.thisRoom.votes,
            this.thisRoom.playersInGame,
          )}`;
          this.thisRoom.sendText(str, 'gameplay-text');
        }
        // Hammer reject
        else if (outcome === 'no' && this.thisRoom.pickNum >= 5) {
          this.thisRoom.lastProposedTeam = this.thisRoom.proposedTeam;
          this.thisRoom.missionHistory[this.thisRoom.missionHistory.length] =
            'failed';

          this.thisRoom.howWasWon = 'Hammer rejected.';
          this.thisRoom.sendText(
            'The hammer was rejected.',
            'gameplay-text-red',
          );
          this.thisRoom.winner = Alliance.Spy;

          this.thisRoom.finishGame(Alliance.Spy);
        } else if (outcome === 'no') {
          this.thisRoom.proposedTeam = [];
          this.thisRoom.changePhase(Phase.PickingTeam);

          const str = `Mission ${this.thisRoom.missionNum}.${
            this.thisRoom.pickNum
          } was rejected.${this.getStrApprovedRejectedPlayers(
            this.thisRoom.votes,
            this.thisRoom.playersInGame,
          )}`;
          this.thisRoom.sendText(str, 'gameplay-text');

          this.thisRoom.incrementTeamLeader();
        }
        this.thisRoom.requireSave = true;
      }

      this.thisRoom.distributeGameData();
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // If user has voted already
    if (
      this.thisRoom.playersYetToVote.indexOf(
        this.thisRoom.playersInGame[indexOfPlayer].username,
      ) === -1
    ) {
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

    // User has not voted yet
    return {
      green: {
        hidden: false,
        disabled: false,
        setText: 'Approve',
      },
      red: {
        hidden: false,
        disabled: false,
        setText: 'Reject',
      },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    let str = '';
    str += 'Waiting for votes: ';
    for (let i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
      str = `${
        str + this.thisRoom.anonymizer.anon(this.thisRoom.playersYetToVote[i])
      }, `;
    }
    // Remove last , and replace with .
    str = str.slice(0, str.length - 2);
    str += '.';

    return str;
  }

  private getStrApprovedRejectedPlayers(votes: string[], playersInGame: any[]) {
    let approvedUsernames = '';
    let rejectedUsernames = '';

    for (let i = 0; i < votes.length; i++) {
      if (votes[i] === 'approve') {
        approvedUsernames = `${
          approvedUsernames +
          this.thisRoom.anonymizer.anon(playersInGame[i].username)
        }, `;
      } else if (votes[i] === 'reject') {
        rejectedUsernames = `${
          rejectedUsernames +
          this.thisRoom.anonymizer.anon(playersInGame[i].username)
        }, `;
      } else {
        console.log(`ERROR! Unknown vote: ${votes[i]}`);
      }
    }
    // Disabled approve rejected people.
    // let str = "<p>Approved: " + approvedUsernames + "</p> <p>Rejected: " + rejectedUsernames + "</p>"
    const str = '';

    return str;
  }

  private calcVotes(votes: string[]) {
    const numOfPlayers = votes.length;
    let countApp = 0;
    let countRej = 0;
    let outcome;

    for (let i = 0; i < numOfPlayers; i++) {
      if (votes[i] === 'approve') {
        // console.log("app");
        countApp++;
      } else if (votes[i] === 'reject') {
        // console.log("rej");
        countRej++;
      } else {
        // console.log("Bad vote: " + votes[i]);
      }
    }
    // calcuate the outcome
    if (countApp > countRej) {
      outcome = 'yes';
    } else {
      outcome = 'no';
    }

    return outcome;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default VotingTeam;
