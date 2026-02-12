import VotingMission from '../phases/common/votingMission';
import { Alliance } from '../types';
import { Role } from '../roles/types';

describe('VotingMission Moregano', () => {
  it('records succeed when Moregano presses fail', () => {
    const moreganoUsername = 'moreganoUser';

    const moreganoPlayer = {
      request: { user: { username: moreganoUsername } },
      username: moreganoUsername,
      alliance: Alliance.Resistance,
      role: Role.Moregano,
    };

const thisRoom: any = {
  playersYetToVote: [moreganoUsername, 'otherUser'],
  playersInGame: [moreganoPlayer],
  missionVotes: {},
  numFailsHistory: [],
  missionHistory: [],
  calcMissionVotes: jest.fn(() => 'succeeded'),
  sendText: jest.fn(),
  changePhase: jest.fn(),
};


    const phase = new VotingMission(thisRoom);

    const socket: any = {
      request: { user: { username: moreganoUsername } },
      emit: jest.fn(),
    };

    phase.gameMove(socket, 'no', []);

expect(thisRoom.playersYetToVote).toHaveLength(1);
expect(thisRoom.calcMissionVotes).not.toHaveBeenCalled();
expect(Object.values(thisRoom.missionVotes)).toContain('succeed');
  });
});
