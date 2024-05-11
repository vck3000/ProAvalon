import {
  IPatreonController,
  MultiplePatreonsForUserError,
  MultipleUsersForPatreonError,
  PatreonAgent,
  PatreonUserTokens,
  PatronFullDetails,
} from '../patreonAgent';

const EXPIRED_DATE = new Date(new Date().getTime() - 60 * 60 * 1000); // 1 hour prior
const NOT_EXPIRED_DATE = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour after

class MockPatreonController implements IPatreonController {
  getPatreonUserTokens = jest.fn();
  refreshPatreonUserTokens = jest.fn();
  getPatronFullDetails = jest.fn();
  getLoginUrl = jest.fn();

  clear() {
    this.getPatreonUserTokens.mockClear();
    this.getPatronFullDetails.mockClear();
    this.getLoginUrl.mockClear();
    this.refreshPatreonUserTokens.mockClear();
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
      userRefreshToken: 'refresh456',
      userAccessTokenExpiry: NOT_EXPIRED_DATE,
    };

    const paidPatronFullDetails: PatronFullDetails = {
      patreonUserId: '123456789',
      isPaidPatron: true,
      amountCents: 100,
      currentPledgeExpiryDate: NOT_EXPIRED_DATE,
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
      userAccessTokenExpiry: NOT_EXPIRED_DATE,
      userRefreshToken: 'String',
      amountCents: 300,
      currentPledgeExpiryDate: NOT_EXPIRED_DATE,
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
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'String',
        amountCents: 0,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
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
        userAccessToken: 'accessABC',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'refreshABC',
        amountCents: 0,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
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
      const result = await patreonAgent.getExistingPatronDetails('usernamelow');

      expect(result).toEqual(null);
      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );
    });

    it('Gets active Patreon details from local database', async () => {
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelow',
        userAccessToken: 'accessABC',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'refreshABC',
        amountCents: 300,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      const result = await patreonAgent.getExistingPatronDetails('usernamelow');
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 300,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );
    });

    it('Retrieves an expired Patreon details and updates it if paid', async () => {
      const mockPatronRecord = {
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelow',
        userAccessToken: 'oldAccessToken',
        userAccessTokenExpiry: EXPIRED_DATE,
        userRefreshToken: 'oldRefreshToken',
        amountCents: 300,
        currentPledgeExpiryDate: EXPIRED_DATE,
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(mockPatronRecord);
      mockPatreonController.refreshPatreonUserTokens.mockResolvedValueOnce({
        userAccessToken: 'newAccessToken',
        userRefreshToken: 'newRefreshToken',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
      });
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce({
        patreonUserId: '123456789',
        isPaidPatron: true,
        amountCents: 400,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      const result = await patreonAgent.getExistingPatronDetails('usernamelow');
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 400,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );
      expect(
        mockPatreonController.refreshPatreonUserTokens,
      ).toHaveBeenCalledWith('oldRefreshToken');
      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'newAccessToken',
      );
      expect(mockPatronRecord.save).toHaveBeenCalled();
    });

    it('Retrieves an expired Patreon details and deletes it if no longer paid', async () => {
      const mockPatronRecord = {
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelow',
        userAccessToken: 'oldAccessToken',
        userAccessTokenExpiry: EXPIRED_DATE,
        userRefreshToken: 'oldRefreshToken',
        amountCents: 300,
        currentPledgeExpiryDate: EXPIRED_DATE,
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(mockPatronRecord);
      mockPatreonController.refreshPatreonUserTokens.mockResolvedValueOnce({
        userAccessToken: 'newAccessToken',
        userRefreshToken: 'newRefreshToken',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
      });
      mockPatreonController.getPatronFullDetails.mockResolvedValueOnce({
        patreonUserId: '123456789',
        isPaidPatron: false,
        amountCents: 0,
        currentPledgeExpiryDate: null,
      });

      const result = await patreonAgent.getExistingPatronDetails('usernamelow');
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: false,
        amountCents: 0,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelow',
      );
      expect(
        mockPatreonController.refreshPatreonUserTokens,
      ).toHaveBeenCalledWith('oldRefreshToken');
      expect(mockPatreonController.getPatronFullDetails).toHaveBeenCalledWith(
        'newAccessToken',
      );
      expect(mockPatronRecord.deleteOne).toHaveBeenCalled();
    });
  });
});
