import { VotingTeam } from './baseStates/votingTeam';
import { SeeSpiesState } from './baseStates/seeSpiesState';

export const states = {
  [VotingTeam.state.toLowerCase()]: VotingTeam,
  [SeeSpiesState.state.toLocaleLowerCase()]: SeeSpiesState,
};

export interface IState {
  state: string;
}
