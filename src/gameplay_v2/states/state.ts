import { VotingTeam } from './baseStates/votingTeam';

export const states = {
  [VotingTeam.state.toLowerCase()]: VotingTeam,
};

export interface IState {
  state: string;
}
