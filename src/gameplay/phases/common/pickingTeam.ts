import usernamesIndexes from '../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { MIN_PLAYERS, NUM_PLAYERS_ON_MISSION } from '../../game';
import { SocketUser } from '../../../sockets/types';

class PickingTeam implements IPhase {
  static phase = Phase.PickingTeam;
  phase = Phase.PickingTeam;
  showGuns = false;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
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

    const numOfTargets = this.thisRoom.getClientNumOfTargets(
      this.thisRoom.teamLeader,
    );
    // catch wrong number of targets
    if (numOfTargets !== selectedPlayers.length && numOfTargets !== null) {
      return;
    }

    // Prohibit duplicate selected players
    const set: Set<string> = new Set();
    for (const player of selectedPlayers) {
      set.add(player);
    }
    if (set.size !== selectedPlayers.length) {
      return;
    }

    // If the person requesting is the host
    if (
      usernamesIndexes.getIndexFromUsername(
        this.thisRoom.playersInGame,
        socket.request.user.username,
      ) === this.thisRoom.teamLeader
    ) {
      // Reset votes
      this.thisRoom.votes = [];
      this.thisRoom.publicVotes = [];

      const num =
        NUM_PLAYERS_ON_MISSION[
          this.thisRoom.playersInGame.length - MIN_PLAYERS
        ][this.thisRoom.missionNum - 1];
      // console.log("Num player for this.thisRoom mission : " + num);

      // Check that the data is valid (i.e. includes only usernames of players)
      for (let i = 0; i < num; i++) {
        // If the data doesn't have the right number of users
        // Or has an empty element
        if (!selectedPlayers[i]) {
          return;
        }
        if (
          this.thisRoom.playerUsernamesInGame.includes(selectedPlayers[i]) ===
          false
        ) {
          return;
        }
      }

      // Continue if it passes the above check
      this.thisRoom.proposedTeam = selectedPlayers;
      // .slice to clone the array
      this.thisRoom.playersYetToVote =
        this.thisRoom.playerUsernamesInGame.slice();

      //--------------------------------------
      // Send out the gameplay text
      //--------------------------------------
      let str = '';
      for (let i = 0; i < selectedPlayers.length; i++) {
        str += `${this.thisRoom.anonymizer.anon(selectedPlayers[i])}, `;
      }

      let str2 = `${this.thisRoom.anonymizer.anon(
        socket.request.user.username,
      )} has picked: ${str}`;

      // remove the last , and replace with .
      str2 = str2.slice(0, str2.length - 2);
      str2 += '.';

      this.thisRoom.sendText(str2, 'gameplay-text');

      this.thisRoom.VHUpdateTeamPick();

      this.thisRoom.changePhase(Phase.VotingTeam);
    } else {
      console.log(
        `User ${socket.request.user.username} is not the team leader. Cannot pick.`,
      );
    }
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // If it is the host
    if (indexOfPlayer === this.thisRoom.teamLeader) {
      return {
        green: {
          hidden: false,
          disabled: true,
          setText: 'Pick',
        },
        red: {
          hidden: true,
          disabled: true,
          setText: '',
        },
      };
    }

    // If it is any other player who isn't host
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

  numOfTargets(indexOfPlayer: number): number {
    const num =
      NUM_PLAYERS_ON_MISSION[this.thisRoom.playersInGame.length - MIN_PLAYERS][
        this.thisRoom.missionNum - 1
      ];

    // If we are not the team leader
    if (indexOfPlayer !== this.thisRoom.teamLeader) {
      return null;
    }

    return num;
  }

  getStatusMessage(indexOfPlayer: number): string {
    if (
      indexOfPlayer !== undefined &&
      indexOfPlayer === this.thisRoom.teamLeader
    ) {
      const num =
        NUM_PLAYERS_ON_MISSION[
          this.thisRoom.playersInGame.length - MIN_PLAYERS
        ][this.thisRoom.missionNum - 1];

      return `Your turn to pick a team. Pick ${num} players.`;
    }

    // console.log(this.thisRoom.teamLeader);
    if (this.thisRoom.playersInGame[this.thisRoom.teamLeader]) {
      return `Waiting for ${this.thisRoom.anonymizer.anon(
        this.thisRoom.playersInGame[this.thisRoom.teamLeader].username,
      )} to pick a team.`;
    }

    return 'ERROR: Tell the admin if you see this, code 10.';
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default PickingTeam;
