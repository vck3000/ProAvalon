import constants from '../constants';
import { RewardData } from '../types';

const obj: RewardData = {
  adminReq: false,
  modReq: false,
  TOReq: false,
  devReq: false,
  percivalReq: false,
  winnerReq: false,
  gamesPlayedReq: 0,
  donationReq: constants.tier2_donation,
};

export default obj;
