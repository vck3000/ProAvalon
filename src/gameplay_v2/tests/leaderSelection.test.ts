import { GameEngine } from '../gameEngine';
import { Leader } from '../roles/components/leader';

describe('GameEngine', () => {
  it('leaderselection', async () => {
    const gameEngine = new GameEngine();

    // input username and datatype
    gameEngine.gameMove('1', { type: 'voteTeam', data: {} });

    // expect(gameEngine.data.state.state).toEqual('VotingTeam');



  });
});