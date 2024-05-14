import {
  IPatreonController,
  MultiplePatreonsForUserError,
  MultipleUsersForPatreonError,
  PatreonAgent,
  PatreonUserTokens,
  PaidPatronFullDetails,
  NotPaidPatronError,
} from '../patreonAgent';

const EXPIRED_DATE = new Date(new Date().getTime() - 60 * 60 * 1000); // 1 hour prior
const NOT_EXPIRED_DATE = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour after

class MockPatreonController implements IPatreonController {
  getPatreonUserTokens = jest.fn();
  refreshPatreonUserTokens = jest.fn();
  getPaidPatronFullDetails = jest.fn();
  getLoginUrl = jest.fn();

  clear() {
    this.getPatreonUserTokens.mockClear();
    this.getPaidPatronFullDetails.mockClear();
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
      userAccessToken: 'access123',
      userRefreshToken: 'refresh456',
      userAccessTokenExpiry: NOT_EXPIRED_DATE,
    };

    const paidPatronFullDetails: PaidPatronFullDetails = {
      patreonUserId: '123456789',
      amountCents: 100,
      currentPledgeExpiryDate: NOT_EXPIRED_DATE,
    };

    let mockGetPatreonRecordFromUsername: any;
    let mockGetPatreonRecordFromPatreonId: any;
    let mockUpdateCurrentPaidPatreonMember: any;

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

      mockUpdateCurrentPaidPatreonMember = jest.spyOn(
        patreonAgent as any,
        'updateCurrentPaidPatreonMember',
      );
    });

    it('Links a paid Patreon account to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce(null);
      mockUpdateCurrentPaidPatreonMember.mockResolvedValueOnce({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 100,
      });

      const result = await patreonAgent.linkUserToPatreon(
        'usernamelower',
        'access123',
      );

      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 100,
      });

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'access123',
      );

      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('access123');

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );

      expect(mockUpdateCurrentPaidPatreonMember).toHaveBeenCalledWith(
        null,
        paidPatronFullDetails,
        'usernamelower',
        patreonUserTokens,
      );
    });

    it('Does not link an unpaid Patreon account to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce(
        null,
      );

      await expect(
        patreonAgent.linkUserToPatreon('usernamelower', 'access123'),
      ).rejects.toThrowError(NotPaidPatronError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'access123',
      );

      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('access123');

      expect(mockUpdateCurrentPaidPatreonMember).not.toHaveBeenCalled();
    });

    it('Does not allow multiple Patreon accounts to be linked to a user', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '987654321',
        proavalonUsernameLower: 'usernamelower',
        userAccessToken: 'access123',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'refresh123',
        amountCents: 0,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      await expect(
        patreonAgent.linkUserToPatreon('usernamelower', 'access123'),
      ).rejects.toThrowError(MultiplePatreonsForUserError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'access123',
      );

      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('access123');

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );
    });

    it('Does not allow multiple users to link the same Patreon account', async () => {
      mockPatreonController.getPatreonUserTokens.mockResolvedValueOnce(
        patreonUserTokens,
      );
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce(
        paidPatronFullDetails,
      );
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      mockGetPatreonRecordFromPatreonId.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'anotherUsername',
        userAccessToken: 'accessOther',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'refreshOther',
        amountCents: 0,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      await expect(
        patreonAgent.linkUserToPatreon('usernamelower', 'access123'),
      ).rejects.toThrowError(MultipleUsersForPatreonError);

      expect(mockPatreonController.getPatreonUserTokens).toHaveBeenCalledWith(
        'access123',
      );

      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('access123');

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );

      expect(mockGetPatreonRecordFromPatreonId).toHaveBeenCalledWith(
        '123456789',
      );
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

    it('Returns null if no Patreon Record in database', async () => {
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(null);
      const result = await patreonAgent.findOrUpdateExistingPatronDetails(
        'usernamelower',
      );

      expect(result).toEqual(null);
      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );
    });

    it('Gets active Patreon details from local database', async () => {
      mockGetPatreonRecordFromUsername.mockResolvedValueOnce({
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelower',
        userAccessToken: 'access123',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
        userRefreshToken: 'refresh123',
        amountCents: 300,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      const result = await patreonAgent.findOrUpdateExistingPatronDetails(
        'usernamelower',
      );
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 300,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );
    });

    it('Retrieves an expired Patreon details and updates it if paid', async () => {
      const mockPatronRecord = {
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelower',
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
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce({
        patreonUserId: '123456789',
        isPaidPatron: true,
        amountCents: 400,
        currentPledgeExpiryDate: NOT_EXPIRED_DATE,
      });

      const result = await patreonAgent.findOrUpdateExistingPatronDetails(
        'usernamelower',
      );
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: true,
        amountCents: 400,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );
      expect(
        mockPatreonController.refreshPatreonUserTokens,
      ).toHaveBeenCalledWith('oldRefreshToken');
      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('newAccessToken');
      expect(mockPatronRecord.save).toHaveBeenCalled();
    });

    it('Retrieves an expired Patreon details and deletes it if no longer paid', async () => {
      const mockRefreshPatreonUserTokens = jest.spyOn(
        patreonAgent as any,
        'refreshPatreonUserTokens',
      );

      const mockPatreonRecord = {
        patreonUserId: '123456789',
        proavalonUsernameLower: 'usernamelower',
        userAccessToken: 'oldAccessToken',
        userAccessTokenExpiry: EXPIRED_DATE,
        userRefreshToken: 'oldRefreshToken',
        amountCents: 300,
        currentPledgeExpiryDate: EXPIRED_DATE,
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      const mockNewUserTokens = {
        userAccessToken: 'newAccessToken',
        userRefreshToken: 'newRefreshToken',
        userAccessTokenExpiry: NOT_EXPIRED_DATE,
      };

      mockGetPatreonRecordFromUsername.mockResolvedValueOnce(mockPatreonRecord);
      mockPatreonController.refreshPatreonUserTokens.mockResolvedValueOnce(
        mockNewUserTokens,
      );
      mockPatreonController.getPaidPatronFullDetails.mockResolvedValueOnce(
        null,
      );

      const result = await patreonAgent.findOrUpdateExistingPatronDetails(
        'usernamelower',
      );
      expect(result).toStrictEqual({
        patreonUserId: '123456789',
        isPledgeActive: false,
        amountCents: 0,
      });

      expect(mockGetPatreonRecordFromUsername).toHaveBeenCalledWith(
        'usernamelower',
      );

      expect(
        mockPatreonController.refreshPatreonUserTokens,
      ).toHaveBeenCalledWith('oldRefreshToken');

      expect(mockRefreshPatreonUserTokens).toHaveBeenCalledWith(
        mockPatreonRecord,
      );

      expect(
        mockPatreonController.getPaidPatronFullDetails,
      ).toHaveBeenCalledWith('newAccessToken');

      expect(mockPatreonRecord.deleteOne).toHaveBeenCalled();
    });
  });
});
