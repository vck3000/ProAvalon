import {
  IPatreonController,
  MultiplePatreonsForUserError,
  MultipleUsersForPatreonError,
  PatreonAgent,
} from '../patreonAgent';

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

  describe('Links user to Patreon', () => {
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

    let mockGetPatreonRecordFromUsername: any;
    let mockGetPatreonRecordFromPatreonId: any;
    let mockUpdateCurrentPatreonMember: any;
    let mockUnlinkPatreon: any;

    beforeEach(() => {
      mockPatreonController.clear();
      patreonAgent = new PatreonAgent(mockPatreonController);

      mockGetPatreonRecordFromUsername = jest.spyOn(
        patreonAgent as any,
        'getPatreonRecordFromUsername',
      );

      mockGetPatreonRecordFromPatreonId = jest.spyOn(
        patreonAgent as any,
        'getPatreonRecordFromPatreonId',
      );

      mockUpdateCurrentPatreonMember = jest.spyOn(
        patreonAgent as any,
        'updateCurrentPatreonMember',
      );

      mockUnlinkPatreon = jest.spyOn(patreonAgent, 'unlinkPatreon');
    });

    it('links a paid patreon account to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronDetails.mockResolvedValueOnce(
        paidPatronDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(null);
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

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );

      expect(mockUpdateCurrentPatreonMember).toHaveBeenCalledWith(
        null,
        paidPatronDetails,
        'usernameLow',
        patreonUserTokens,
      );
    });

    it('Does not allow multiple Patreon accounts to be linked to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronDetails.mockResolvedValueOnce(
        paidPatronDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernameLow',
        userAccessToken: 'String',
        userAccessTokenExpiry: new Date(),
        userRefreshToken: 'String',
        amountCents: 0,
        currentPledgeExpiryDate: new Date(),
      });

      await expect(
        patreonAgent.linkUserToPatreon('usernameLow', 'codeAbc'),
      ).rejects.toThrowError(MultiplePatreonsForUserError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'codeAbc',
      );

      expect(mockPatreonController.getPaidPatronDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernameLow',
      );
    });

    it('Does not allow multiple users to link the same Patreon account', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronDetails.mockResolvedValueOnce(
        paidPatronDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'anotherUsername',
        userAccessToken: 'String',
        userAccessTokenExpiry: new Date(),
        userRefreshToken: 'String',
        amountCents: 0,
        currentPledgeExpiryDate: new Date(),
      });

      await expect(
        patreonAgent.linkUserToPatreon('usernameLow', 'codeAbc'),
      ).rejects.toThrowError(MultipleUsersForPatreonError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'codeAbc',
      );

      expect(mockPatreonController.getPaidPatronDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernameLow',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );
    });

    it('Unlinks an unpaid patreon account from a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronDetails.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernameLow',
        userAccessToken: 'String',
        userAccessTokenExpiry: new Date(),
        userRefreshToken: 'String',
        amountCents: 300,
        currentPledgeExpiryDate: new Date(),
      });
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(null);

      const result = await patreonAgent.linkUserToPatreon(
        'usernameLow',
        'codeAbc',
      );

      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: false,
        amountCents: 0,
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

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );

      expect(mockUnlinkPatreon).toHaveBeenCalledWith('usernameLow');
    });
  });
});
