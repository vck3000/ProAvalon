import {
  IPatreonController,
  MultiplePatreonsForUserError,
  MultipleUsersForPatreonError,
  PatreonAgent,
  PatreonUserTokens,
  PatronFullDetails,
} from '../patreonAgent';

class MockPatreonController implements IPatreonController {
  getPatreonUserTokens = jest.fn();
  refreshPatreonUserTokens = jest.fn();
  getPatronFullDetails = jest.fn();
  getLoginUrl = jest.fn();

  clear() {
    this.getPatreonUserTokens.mockClear();
    this.getPatronFullDetails.mockClear();
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
    const patreonUserTokens: PatreonUserTokens = {
      userAccessToken: 'accessAbc',
      userRefreshToken: 'refreshDef',
      userAccessTokenExpiry: new Date('2024-05-31'),
    };

    const paidPatronFullDetails: PatronFullDetails = {
      patreonUserId: '123456789',
      isPaidPatron: true,
      amountCents: 100,
      currentPledgeExpiryDate: new Date('2024-06-15'),
    };

    const unpaidPatronFullDetails: PatronFullDetails = {
      patreonUserId: '123456789',
      isPaidPatron: false,
      amountCents: null,
      currentPledgeExpiryDate: null,
    };

    const mockPatreonRecord = {
      patreonUserId: '123456789',
      proavalonUsernameLower: 'usernamelow',
      userAccessToken: 'String',
      userAccessTokenExpiry: new Date(),
      userRefreshToken: 'String',
      amountCents: 300,
      currentPledgeExpiryDate: new Date(),
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

      mockUnlinkPatreon = jest.spyOn(patreonAgent as any, 'unlinkPatreon');
    });

    it('links a paid patreon account to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(null);
      mockUpdateCurrentPatreonMember.mockResolvedValueOnce({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 100,
      });

      const result = await patreonAgent.linkUserToPatreon(
        'usernamelow',
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

      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );

      expect(mockUpdateCurrentPatreonMember).toHaveBeenCalledWith(
        null,
        paidPatronFullDetails,
        'usernamelow',
        patreonUserTokens,
      );
    });

    it('Does not allow multiple Patreon accounts to be linked to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '987654321',
        proavalonUsernameLower: 'usernamelow',
        userAccessToken: 'String',
        userAccessTokenExpiry: new Date(),
        userRefreshToken: 'String',
        amountCents: 0,
        currentPledgeExpiryDate: new Date(),
      });

      await expect(
        patreonAgent.linkUserToPatreon('usernamelow', 'codeAbc'),
      ).rejects.toThrowError(MultiplePatreonsForUserError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'codeAbc',
      );

      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );
    });

    it('Does not allow multiple users to link the same Patreon account', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
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
        patreonAgent.linkUserToPatreon('usernamelow', 'codeAbc'),
      ).rejects.toThrowError(MultipleUsersForPatreonError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'codeAbc',
      );

      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );
    });

    it('Unlinks an unpaid patreon account from a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce(
        unpaidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(mockPatreonRecord);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(
        mockPatreonRecord,
      );
      mockUnlinkPatreon.mockResolvedValueOnce(true);

      const result = await patreonAgent.linkUserToPatreon(
        'usernamelow',
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

      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'accessAbc',
      );

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );

      expect(mockUnlinkPatreon).toHaveBeenCalledWith('usernamelow');
    });
  });

  describe('Gets user Patreon details from local database', () => {
    const mockActivePatreonRecord = {
      patreonUserId: '123456789',
      proavalonUsernameLower: 'usernamelow',
      userAccessToken: 'String',
      userAccessTokenExpiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day after
      userRefreshToken: 'String',
      amountCents: 300,
      currentPledgeExpiryDate: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day after
    };
    const mockExpiredPatreonRecord = {
      patreonUserId: '123456789',
      proavalonUsernameLower: 'usernamelow',
      userAccessToken: 'String',
      userAccessTokenExpiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day after,
      userRefreshToken: 'String',
      amountCents: 300,
      currentPledgeExpiryDate: new Date().getTime() - 24 * 60 * 60 * 1000, // 1 day before
    };

    let mockGetPatreonRecordFromUsername: any;

    beforeEach(() => {
      mockPatreonController.clear();
      patreonAgent = new PatreonAgent(mockPatreonController);

      mockGetPatreonRecordFromUsername = jest.spyOn(
        patreonAgent as any,
        'getPatreonRecordFromUsername',
      );
    });

    it('Returns null if no PatreonRecord in database', async () => {
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      const result = await patreonAgent.getExistingPatronDetails('usernameLow');
      expect(result).toEqual(null);
    });

    it('Gets active Patreon details from local database', async () => {
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(
        mockActivePatreonRecord,
      );

      const result = await patreonAgent.getExistingPatronDetails('usernameLow');
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 300,
      });
    });
  });
});
