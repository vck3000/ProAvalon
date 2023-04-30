import { GameEngine } from '../gameEngine';
import { Vote } from '../roles/components/vote';

describe('GameEngine', () => {
  it('correctly transitions from VotingTeam to VotingMission', async () => {
    const gameEngine = new GameEngine();

    gameEngine.gameMove('1', { type: 'voteTeam', data: Vote.Approve });
    gameEngine.gameMove('2', { type: 'voteTeam', data: Vote.Approve });
    gameEngine.gameMove('3', { type: 'voteTeam', data: Vote.Approve });
    gameEngine.gameMove('4', { type: 'voteTeam', data: Vote.Approve });

    //expect(gameEngine.data.state.state).toEqual('VotingTeam');

    gameEngine.gameMove('5', { type: 'voteTeam', data: Vote.Approve });

    //expect(gameEngine.data.state.state).toEqual('VotingMission');
  });
});