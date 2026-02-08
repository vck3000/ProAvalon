import usernamesIndexes from '../../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { Alliance } from '../../types';
import { SocketUser } from '../../../../sockets/types';
import { Role } from '../../roles/types';

class VotingMission implements IPhase {
  static phase = Phase.VotingMission;
  phase = Phase.VotingMission;
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
    const i = this.thisRoom.playersYetToVote.indexOf(
      socket.request.user.username,
    );

    // if this.thisRoom vote is coming from someone who hasn't voted yet
    if (i !== -1) {
      if (buttonPressed === 'yes') {
        this.thisRoom.missionVotes[
          usernamesIndexes.getIndexFromUsername(
            this.thisRoom.playersInGame,
            socket.request.user.username,
          )
        ] = 'succeed';
        // console.log("received succeed from " + socket.request.user.username);
      } else if (buttonPressed === 'no') {
        // Determine the player index
        const index = usernamesIndexes.getIndexFromUsername(
          this.thisRoom.playersInGame,
          socket.request.user.username,
        );

        // If player is Resistance and NOT Moregano, block failing
        if (
          index !== -1 &&
          this.thisRoom.playersInGame[index].alliance === Alliance.Resistance &&
          this.thisRoom.playersInGame[index].role !== Role.Moregano
        ) {
          socket.emit(
            'danger-alert',
            'You are resistance! Surely you want to succeed!',
          );
          return;
        }

        // If player is Moregano and pressed "no", silently record "succeed".
        const effectiveVote =
          index !== -1 &&
          this.thisRoom.playersInGame[index].role === Role.Moregano
            ? 'succeed'
            : 'fail';

        this.thisRoom.missionVotes[
          usernamesIndexes.getIndexFromUsername(
            this.thisRoom.playersInGame,
            socket.request.user.username,
          )
        ] = effectiveVote;

        // console.log("received fail from " + socket.request.user.username);
      } else {
        console.log(
          `ERROR! Expected yes or no (success/fail), got: ${buttonPressed}`,
        );
      }
      // remove the player from players yet to vote
      this.thisRoom.playersYetToVote.splice(i, 1);
    } else {
      console.log(
        `Player ${socket.request.user.username} has already voted or is not in the game`,
      );
    }

    // If we have all the votes in
    if (this.thisRoom.playersYetToVote.length === 0) {
      const outcome = this.thisRoom.calcMissionVotes(
        this.thisRoom.missionVotes,
      );
      if (outcome) {
        this.thisRoom.missionHistory.push(outcome);
      } else {
        console.log(`ERROR! Outcome was: ${outcome}`);
      }

      const numOfVotedFails = this.countFails(this.thisRoom.missionVotes);
      this.thisRoom.numFailsHistory.push(numOfVotedFails);

      // for the gameplay message
      if (outcome === 'succeeded') {
        if (numOfVotedFails === 0) {
          this.thisRoom.sendText(
            `Mission ${this.thisRoom.missionNum} succeeded.`,
            'gameplay-text-blue',
          );
        } else {
          this.thisRoom.sendText(
            `Mission ${this.thisRoom.missionNum} succeeded, but with ${numOfVotedFails} fail.`,
            'gameplay-text-blue',
          );
        }
      } else if (outcome === 'failed') {
        if (numOfVotedFails === 1) {
          this.thisRoom.sendText(
            `Mission ${this.thisRoom.missionNum} failed with ${numOfVotedFails} fail.`,
            'gameplay-text-red',
          );
        } else {
          this.thisRoom.sendText(
            `Mission ${this.thisRoom.missionNum} failed with ${numOfVotedFails} fails.`,
            'gameplay-text-red',
          );
        }
      }

      // TODO move these arrays out of Game and into this class.
      // if we get all the votes in, then do this.thisRoom
      this.thisRoom.lastProposedTeam = this.thisRoom.proposedTeam;
      this.thisRoom.proposedTeam = [];
      this.thisRoom.missionVotes = [];

      // count number of succeeds and fails
      let numOfSucceeds = 0;
      let numOfFails = 0;
      for (let i = 0; i < this.thisRoom.missionHistory.length; i++) {
        if (this.thisRoom.missionHistory[i] === 'succeeded') {
          numOfSucceeds++;
        } else if (this.thisRoom.missionHistory[i] === 'failed') {
          numOfFails++;
        }
      }

      // Critical mission if 2 fails
      if (numOfFails == 2) {
        this.thisRoom.critMission = true;
      }

      // game over if more than 3 fails or successes
      if (numOfFails >= 3) {
        this.thisRoom.winner = Alliance.Spy;
        this.thisRoom.howWasWon = 'Mission fails.';
        this.thisRoom.finishGame(Alliance.Spy);
      } else if (numOfSucceeds >= 3) {
        this.thisRoom.winner = Alliance.Resistance;
        this.thisRoom.howWasWon = 'Mission successes';
        this.thisRoom.finishGame(Alliance.Resistance);
      }
      // If the game goes on
      else {
        this.thisRoom.missionNum++;
        this.thisRoom.pickNum = 1;

        this.thisRoom.teamLeader--;
        if (this.thisRoom.teamLeader < 0) {
          this.thisRoom.teamLeader = this.thisRoom.playersInGame.length - 1;
        }

        this.thisRoom.hammer =
          (this.thisRoom.teamLeader -
            5 +
            1 +
            this.thisRoom.playersInGame.length) %
          this.thisRoom.playersInGame.length;
        this.thisRoom.changePhase(Phase.PickingTeam);
      }
      this.thisRoom.requireSave = true;
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // If user has voted
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
    const player = this.thisRoom.playersInGame[indexOfPlayer];
    const effectiveAlliance =
      (player as any).displayAlliance !== undefined
        ? (player as any).displayAlliance
        : player.alliance;

    // Resistance (view) can't fail
    const redHidden = effectiveAlliance === Alliance.Resistance;

    return {
      green: {
        hidden: false,
        disabled: false,
        setText: 'SUCCEED',
      },
      red: {
        hidden: redHidden,
        disabled: redHidden,
        setText: 'FAIL',
      },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    // If we are spectator
    if (indexOfPlayer === -1) {
      let str = '';
      str += 'Waiting for mission votes: ';
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
    // If the user is someone who needs to vote success or fail
    if (
      indexOfPlayer !== undefined &&
      this.thisRoom.playersYetToVote.indexOf(
        this.thisRoom.playersInGame[indexOfPlayer].username,
      ) !== -1
    ) {
      let str = '';
      str += `${this.thisRoom.anonymizer.anon(
        this.thisRoom.playersInGame[this.thisRoom.teamLeader].username,
      )} has picked: `;

      for (let i = 0; i < this.thisRoom.proposedTeam.length; i++) {
        str += `${this.thisRoom.anonymizer.anon(
          this.thisRoom.proposedTeam[i],
        )}, `;
      }
      // Remove last , and replace with .
      str = str.slice(0, str.length - 2);
      str += '.';

      return str;
    }

    let str = '';
    str += 'Waiting for mission votes: ';
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

  private countFails(votes: string[]) {
    let numOfVotedFails = 0;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i] === 'fail') {
        numOfVotedFails++;
      }
    }
    return numOfVotedFails;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default VotingMission;
