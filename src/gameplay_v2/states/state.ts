import { VotingTeam } from './baseStates/votingTeam';
import { VotingMission } from './baseStates/votingMission';
import { AssassinationPhase } from './baseStates/assassinationPhase';

export const states = {
  [VotingTeam.state.toLowerCase()]: VotingTeam,
  [VotingMission.state.toLowerCase()]: VotingMission,
  [AssassinationPhase.state.toLowerCase()]: AssassinationPhase,
};

export interface IState {
  state: string;
}
