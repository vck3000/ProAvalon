import patreonRecord from '../../models/patreonRecord';

export interface PatreonUserTokens {
  userAccessToken: string;
  userRefreshToken: string;
  userAccessTokenExpiry: Date;
}

export interface PaidPatronFullDetails {
  patreonUserId: string;
  amountCents: number;
  currentPledgeExpiryDate: Date;
}

export interface IPatreonController {
  getPatreonUserTokens(code: string): Promise<PatreonUserTokens>;
  refreshPatreonUserTokens(refreshToken: string): Promise<PatreonUserTokens>;
  getPaidPatronFullDetails(
    patronAccessToken: string,
  ): Promise<PaidPatronFullDetails | null>;
  getLoginUrl(): string;
}

export class NotPaidPatronError extends Error {
  message = 'Attempted to link an unpaid Patreon account.';
}

export class MultiplePatreonsForUserError extends Error {
  message = 'Attempted to link multiple Patreon accounts to a single user.';
}

export class MultipleUsersForPatreonError extends Error {
  message = 'Attempted to link a Patreon to multiple users.';
}

export interface PatronDetails {
  patreonUserId: string;
  isPledgeActive: boolean;
  amountCents: number;
}

export class PatreonAgent {
  private patreonController: IPatreonController;

  constructor(controller: IPatreonController) {
    this.patreonController = controller;
  }

  public getLoginUrl() {
    return this.patreonController.getLoginUrl();
  }

  // Checks the patron status for a given user
  public async findOrUpdateExistingPatronDetails(
    usernameLower: string,
  ): Promise<PatronDetails | null> {
    const patronRecord = await this.getPatreonRecordFromUsername(usernameLower);
    if (!patronRecord) {
      return null;
    }

    if (!this.hasExpired(patronRecord.currentPledgeExpiryDate)) {
      return {
        patreonUserId: patronRecord.patreonUserId,
        isPledgeActive: true,
        amountCents: patronRecord.amountCents,
      };
    } else {
      // Check with Patreon if user has renewed
      if (this.hasExpired(patronRecord.userAccessTokenExpiry)) {
        // Get updated tokens if token expired
        const tokens = await this.patreonController.refreshPatreonUserTokens(
          patronRecord.userRefreshToken,
        );

        patronRecord.userAccessToken = tokens.userAccessToken;
        patronRecord.userAccessTokenExpiry = tokens.userAccessTokenExpiry;
        patronRecord.userRefreshToken = tokens.userRefreshToken;
      }

      const paidPatronFullDetails =
        await this.patreonController.getPaidPatronFullDetails(
          patronRecord.userAccessToken,
        );

      if (paidPatronFullDetails) {
        patronRecord.amountCents = paidPatronFullDetails.amountCents;
        patronRecord.currentPledgeExpiryDate =
          paidPatronFullDetails.currentPledgeExpiryDate;

        await patronRecord.save();
        return {
          patreonUserId: patronRecord.patreonUserId,
          isPledgeActive: true,
          amountCents: paidPatronFullDetails.amountCents,
        };
      } else {
        // Delete record if not paid
        await patronRecord.deleteOne();

        // isPledgeActive is set to false for previously active accounts that have now expired
        return {
          patreonUserId: paidPatronFullDetails.patreonUserId,
          isPledgeActive: false,
          amountCents: 0,
        };
      }
    }
  }

  // This path is hit after a user has been redirected back from Patreon.
  public async linkUserToPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatronDetails> {
    // Grab user tokens
    const patreonUserTokens = await this.patreonController.getPatreonUserTokens(
      code,
    );

    // Grab member details from Patreon with token
    const paidPatronFullDetails =
      await this.patreonController.getPaidPatronFullDetails(
        patreonUserTokens.userAccessToken,
      );

    if (!paidPatronFullDetails) {
      throw new NotPaidPatronError();
    }

    // Grab Patreon document from MongoDB
    const existingPatreonRecordForUser =
      await this.getPatreonRecordFromUsername(usernameLower);

    // Do not let more than one patreon account be linked to the same user.
    // This path is not expected to be hit as GUI should enforce a user to not be able to
    // link another patreon account whilst they're still linked to another one.
    if (
      existingPatreonRecordForUser &&
      existingPatreonRecordForUser.patreonUserId !==
        paidPatronFullDetails.patreonUserId
    ) {
      throw new MultiplePatreonsForUserError();
    }

    // Do not let one patreon be used for more than one user
    const existingPatreonRecordForOtherUser =
      await this.getPatreonRecordFromPatreonId(
        paidPatronFullDetails.patreonUserId,
      );
    if (
      existingPatreonRecordForOtherUser &&
      existingPatreonRecordForOtherUser.proavalonUsernameLower !== usernameLower
    ) {
      throw new MultipleUsersForPatreonError();
    }

    const result = await this.updateCurrentPaidPatreonMember(
      existingPatreonRecordForUser,
      paidPatronFullDetails,
      usernameLower,
      patreonUserTokens,
    );

    console.log(
      `Successfully linked Patreon account: proavalonUsernameLower="${usernameLower}" patreonUserId="${paidPatronFullDetails.patreonUserId}" isPledgeActive="${result.isPledgeActive}" amountCents="${result.amountCents}"`,
    );

    return result;
  }

  private async updateCurrentPaidPatreonMember(
    existingPatreonRecord: any,
    paidPatronFullDetails: PaidPatronFullDetails,
    usernameLower: string,
    patreonUserTokens: PatreonUserTokens,
  ): Promise<PatronDetails> {
    const patreonRecordUpdateDetails = {
      patreonUserId: paidPatronFullDetails.patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: patreonUserTokens.userAccessToken,
      userRefreshToken: patreonUserTokens.userRefreshToken,
      userAccessTokenExpiry: patreonUserTokens.userAccessTokenExpiry,
      amountCents: paidPatronFullDetails.amountCents,
      currentPledgeExpiryDate: paidPatronFullDetails.currentPledgeExpiryDate,
    };

    if (existingPatreonRecord) {
      if (
        existingPatreonRecord.currentPledgeExpiryDate >
        patreonRecordUpdateDetails.currentPledgeExpiryDate
      ) {
        patreonRecordUpdateDetails.currentPledgeExpiryDate =
          existingPatreonRecord.currentPledgeExpiryDate;
      }

      await patreonRecord.findOneAndUpdate(
        {
          proavalonUsernameLower: usernameLower,
        },
        patreonRecordUpdateDetails,
      );
    } else {
      await patreonRecord.create(patreonRecordUpdateDetails);
    }

    return {
      patreonUserId: paidPatronFullDetails.patreonUserId,
      isPledgeActive: true,
      amountCents: paidPatronFullDetails.amountCents,
    };
  }

  public async unlinkPatreon(usernameLower: string) {
    const deletedPatreon = await patreonRecord.findOneAndDelete({
      proavalonUsernameLower: usernameLower,
    });

    return Boolean(deletedPatreon);
  }

  private hasExpired(expiryDate: Date) {
    return expiryDate < new Date();
  }

  private async getPatreonRecordFromUsername(usernameLower: string) {
    const patronRecord = await patreonRecord.findOne({
      proavalonUsernameLower: usernameLower,
    });

    return patronRecord ? patronRecord : null;
  }

  private async getPatreonRecordFromPatreonId(patreonUserId: string) {
    const patronRecord = await patreonRecord.findOne({
      patreonUserId,
    });

    return patronRecord ? patronRecord : null;
  }
}
