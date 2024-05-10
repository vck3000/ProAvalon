import { IPatreonController, PatreonAgent } from '../patreonAgent';
import patreon from '../../../routes/patreon';

class MockPatreonController implements IPatreonController {
  getPatreonUserTokens = jest.fn();
  getPaidPatronDetails = jest.fn();
  getLoginUrl = jest.fn();

  clear() {
    this.getPatreonUserTokens.mockClear();
    this.getPaidPatronDetails.mockClear();
    this.getLoginUrl.mockClear();
  }
}

describe('PatreonAgent', () => {
  let patreonAgent: PatreonAgent;
  const mockPatreonController = new MockPatreonController();

  beforeEach(() => {
    mockPatreonController.clear();

    patreonAgent = new PatreonAgent(mockPatreonController);
  });

  it('links a paid patreon account to a user', async () => {
    // Mock objects
    const patreonUserTokens = {
      userAccessToken: 'accessAbc',
      userRefreshToken: 'refreshDef',
      userAccessTokenExpiry: new Date('2024-05-31'),
    };
    const paidPatronDetails = {
      patreonUserId: '123456789',
      amountCents: 100,
      currentPledgeExpiryDate: new Date('2024-06-15'),
    };

    mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
      patreonUserTokens,
    );
    mockPatreonController.getPaidPatronDetails.mockResolvedValueOnce(
      paidPatronDetails,
    );

    const mockGetPatreonRecordFromUsername = jest.spyOn(
      patreonAgent as any,
      'getPatreonRecordFromUsername',
    );
    mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);

    const mockGetPatreonRecordFromPatreonId = jest.spyOn(
      patreonAgent as any,
      'getPatreonRecordFromPatreonId',
    );
    mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(null);

    const mockUpdateCurrentPatreonMember = jest.spyOn(
      patreonAgent as any,
      'updateCurrentPatreonMember',
    );
    mockUpdateCurrentPatreonMember.mockResolvedValueOnce({
      patreonUserId: '123456789',
      isPledgeActive: true,
      amountCents: 100,
    });

    const result = await patreonAgent.linkUserToPatreon(
      'usernameLow',
      'codeAbc',
    );

    expect(result).toStrictEqual({
      patreonUserId: '123456789',
      isPledgeActive: true,
      amountCents: 100,
    });

    expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
      'codeAbc',
    );

    expect(mockPatreonController.getPaidPatronDetails).toHaveBeenCalledWith(
      'accessAbc',
    );

    expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
      'usernameLow',
    );

    expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith('123456789');

    expect(mockUpdateCurrentPatreonMember).toHaveBeenCalledWith(
      null,
      paidPatronDetails,
      'usernameLow',
      patreonUserTokens,
    );
  });
});
