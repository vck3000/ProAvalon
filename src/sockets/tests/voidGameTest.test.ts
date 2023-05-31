import Game from '../../gameplay/game';

jest.mock('../../gameplay/game');

describe('Game', () => {

  let mockGame:Game;

  beforeEach(() => {
    const host = 'John';
    const roomId = '12345';
    const io = {}; 
    const maxNumPlayers = 8;
    const newRoomPassword = 'password';
    const gameMode = 'classic';
    const muteSpectators = true;
    const disableVoteHistory = false;
    const ranked = true;
    const callback = jest.fn();

    mockGame = new Game(
      host,
      roomId,
      io,
      maxNumPlayers,
      newRoomPassword,
      gameMode,
      muteSpectators,
      disableVoteHistory,
      ranked,
      callback
    );
  });

  it('should set the phase to "voided"', () => {
    mockGame.phase = 'pickingTeam';
    mockGame.voidedGame();
    expect(mockGame.voidedGame).toBeCalledTimes(1);
    expect(mockGame.phase).toBe('voided');
  });

});