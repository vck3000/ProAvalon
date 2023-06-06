import { eloConstants } from '../elo/constants/eloConstants';
import Rank from '../models/rank';
import { IUser } from '../models/types';
import User from '../models/user';

class leaveGameDetection {
  room: number;
  leavePlayers: string[];
  nonLeavePlayers: string[];

  constructor(
    roomid_: number,
    leavePlayers_: string[],
    nonLeavePlayers_: string[],
  ) {
    this.room = roomid_;
    this.leavePlayers = leavePlayers_;
    this.nonLeavePlayers = nonLeavePlayers_;
  }
  
  async redistributeScores(score: number, users: IUser[]): Promise<void> {
    //redistruibute the scores to the rest of the players
    const compensation = score / users.length;
    for (const user of users) {
      const rankData = await Rank.findById(user.currentRanking);
      rankData.leavePenalty += compensation;
      await rankData.save();
    }
  }

  async leavePenalty(users: IUser[]): Promise<number> {
    for (const user of users) {
      const rankData = await Rank.findById(user.currentRanking);
      rankData.leavePenalty -= eloConstants.LEAVE_PENALTY;
      await rankData.save();
    }
    return eloConstants.LEAVE_PENALTY * users.length;
  }

  async punishingPlayers(
  ): Promise<void> {
    let leaves = [];
    for (const leavePlayer of this.leavePlayers) {
      const leaveUser = await User.findOne({
        username: leavePlayer.toLowerCase(),
      });
      leaves.push(leaveUser);
    }
    const redistributeScore = await this.leavePenalty(leaves);
    console.log(`Redistribute score: ${redistributeScore}`);
    const nonleaves = [];
    for (const otherPlayer of this.nonLeavePlayers) {
      const otherUser = await User.findOne({
        username: otherPlayer.toLowerCase(),
      });
      nonleaves.push(otherUser);
    }
    await this.redistributeScores(redistributeScore, nonleaves);
  }
}
export default leaveGameDetection;