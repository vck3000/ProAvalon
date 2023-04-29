import { VotingTeam } from './baseStates/votingTeam';
import { VotingMission } from './baseStates/VotingMission';
import { AssassinationPhase } from './baseStates/assassinationPhase';
import { SpecialPhase } from './baseStates/specialphase';
import { State } from '../gameTypes';

export const states = {
  [VotingTeam.state]: VotingTeam,
  [VotingMission.state]: VotingMission,
  [AssassinationPhase.state]: AssassinationPhase,
  [SpecialPhase.state]: SpecialPhase,
};

export interface IState {
  state: State;
}