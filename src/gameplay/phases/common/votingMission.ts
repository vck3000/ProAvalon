import usernamesIndexes from '../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { Alliance } from '../../types';
import { SocketUser } from '../../../sockets/types';
import { GameMode } from '../../gameModes';
import { MIN_PLAYERS } from '../../game';

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
        // If the user is a res, they shouldn't be allowed to fail
        const index = usernamesIndexes.getIndexFromUsername(
          this.thisRoom.playersInGame,
          socket.request.user.username,
        );
        if (
          index !== -1 &&
          this.thisRoom.playersInGame[index].alliance === Alliance.Resistance
        ) {
          socket.emit(
            'danger-alert',
            'You are resistance! Surely you want to succeed!',
          );
          return;
        }

        this.thisRoom.missionVotes[
          usernamesIndexes.getIndexFromUsername(
            this.thisRoom.playersInGame,
            socket.request.user.username,
          )
        ] = 'fail';
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

        
        this.updateMissionSizesForSinad();
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
    // Resistance can't fail
    const redHidden =
      this.thisRoom.playersInGame[indexOfPlayer].alliance ===
      Alliance.Resistance;

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

  updateMissionSizesForSinad(): void {
    // in 6p avalon, if m1 and m2 both succeed and m3 is a dani's pick (i.e. m3!=m2+1)
    // then the sizes of m4 and m5 are swapped, requiring 4 ppl and 3 ppl respectively. 

    if(!this.thisRoom.enableSinadMode)
    {
      return;
    }
    if(this.thisRoom.playersInGame.length !== 6 && this.thisRoom.gameMode !== GameMode.AVALON)
    {
      return; //not tested for other gamemodes. 
    }

    const VH = this.thisRoom.voteHistory; //for brevity

    const setOfPlayersOnM2 = new Set<string>();
    const setOfPlayersOnM3 = new Set<string>();


    if( 
      //m1 m2 pass, m3 failed, and we're at m4.1
      this.thisRoom.missionHistory &&
      this.thisRoom.missionHistory.length === 3 && 
      this.thisRoom.missionHistory[0] === 'succeeded' &&
      this.thisRoom.missionHistory[1] === 'succeeded' &&
      this.thisRoom.missionHistory[2] === 'failed' &&
      this.thisRoom.missionNum === 4 &&
      this.thisRoom.pickNum === 1
    ) { 
      for (const player in VH) {
        if (VH.hasOwnProperty(player)) {
            
          const playerVH = VH[player];
          const playerM2 = playerVH[1][playerVH[1].length -1];
          const playerM3 = playerVH[2][playerVH[2].length -1];

          if (typeof playerM2 === 'string' && playerM2.includes("VHpicked")) {
            setOfPlayersOnM2.add(player);
          }
          if (typeof playerM3 === 'string' && playerM3.includes("VHpicked")) {
            setOfPlayersOnM3.add(player);
          }
        }
      }

      let isM2ASubsetOfM3: boolean = [...setOfPlayersOnM2].every(player => setOfPlayersOnM3.has(player));
   
      if(!isM2ASubsetOfM3) {
        this.thisRoom.NUM_PLAYERS_ON_MISSION[6-MIN_PLAYERS] = [2,3,4,4,3];
        let announcingSinadMode: string = "The mission sizes of Mission 4 and Mission 5 have been swapped!";
        this.thisRoom.sendText(announcingSinadMode,'gameplay-text');
      }  
    }
  }
}

export default VotingMission;
