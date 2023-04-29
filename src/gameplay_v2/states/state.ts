import { VotingTeam } from './baseStates/votingTeam';
import { VotingMission } from './baseStates/votingMission';
import { AssassinationPhase } from './baseStates/assassinationPhase';
import { SpecialPhase } from './baseStates/specialphase';

export const states = {
  [VotingTeam.state.toLowerCase()]: VotingTeam,
  [VotingMission.state.toLowerCase()]: VotingMission,
  [AssassinationPhase.state.toLowerCase()]: AssassinationPhase,
  [SpecialPhase.state.toLowerCase()]: SpecialPhase,
};

export interface IState {
  state: string;
}