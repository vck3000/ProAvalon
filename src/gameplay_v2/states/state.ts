import { VotingTeam } from './baseStates/votingTeam';
import { VotingMission } from './baseStates/votingMission';

export const states = {
  [VotingTeam.state.toLowerCase()]: VotingTeam,
  [VotingMission.state.toLowerCase()]: VotingMission,
};

export interface IState {
  state: string;
}
