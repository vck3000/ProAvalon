import patreonRecord from '../../models/patreonRecord';

export interface PatreonUserTokens {
  userAccessToken: string;
  userRefreshToken: string;
  userAccessTokenExpiry: Date;
}

export interface PatronFullDetails {
  patreonUserId: string;
  patronMemberDetails: {
    lastChargeDate: Date;
    lastChargeStatus: string;
    nextChargeDate: Date;
    amountCents: number;
  };
}

export interface IPatreonController {
  getPatreonUserTokens(code: string): Promise<PatreonUserTokens>;
  getPatronFullDetails(patronAccessToken: string): Promise<PatronFullDetails>;
  getLoginUrl(): string;
}

export class MultiplePatreonsForUserError extends Error {
  name = 'MultiplePatreonsForUserError';
  message = 'Attempted to link multiple Patreon accounts to a single user.';
}

export class MultipleUsersForPatreonError extends Error {
  name = 'MultipleUsersForPatreonError';
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

  public async getExistingPatronDetails(
    usernameLower: string,
  ): Promise<PatronDetails> {
    // This function is to check for features in general on load

    const patronRecord = await this.getPatreonRecordFromUsername(usernameLower);
    if (!patronRecord) {
      return null;
    }

    const isPledgeActive = !this.hasExpired(
      patronRecord.currentPledgeExpiryDate,
    );

    return {
      patreonUserId: patronRecord.patreonUserId,
      isPledgeActive,
      amountCents: patronRecord.amountCents,
    };
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
    const patronFullDetails = await this.patreonController.getPatronFullDetails(
      patreonUserTokens.userAccessToken,
    );

    // Grab Patreon document from MongoDB
    const existingPatreonRecordForUser =
      await this.getPatreonRecordFromUsername(usernameLower);

    // Do not let more than one patreon account be linked to the same user.
    // This path is not expected to be hit as GUI should enforce a user to not be able to
    // link another patreon account whilst they're still linked to another one.
    if (
      existingPatreonRecordForUser &&
      existingPatreonRecordForUser.patreonUserId !==
        patronFullDetails.patreonUserId
    ) {
      throw new MultiplePatreonsForUserError();
    }

    // Do not let one patreon be used for more than one user
    const existingPatreonRecordForOtherUser =
      await this.getPatreonRecordFromPatreonId(patronFullDetails.patreonUserId);

    if (
      existingPatreonRecordForOtherUser &&
      existingPatreonRecordForOtherUser.proavalonUsernameLower !== usernameLower
    ) {
      throw new MultipleUsersForPatreonError();
    }

    if (patronFullDetails.patronMemberDetails) {
      // They are a current member
      const result = await this.updateCurrentPatreonMember(
        existingPatreonRecordForUser,
        patronFullDetails,
        usernameLower,
        patreonUserTokens,
      );

      console.log(
        `Successfully linked Patreon account: proavalonUsernameLower="${usernameLower}" patreonUserId="${patronFullDetails.patreonUserId}" isPledgeActive="${result.isPledgeActive}" amountCents="${result.amountCents}"`,
      );

      return result;
    } else {
      // They are not a current member to the Patreon page
      if (existingPatreonRecordForUser) {
        await this.unlinkPatreon(
          existingPatreonRecordForUser.proavalonUsernameLower,
        );
      }

      return {
        patreonUserId: patronFullDetails.patreonUserId,
        isPledgeActive: false,
        amountCents: 0,
      };
    }
  }

  private async updateCurrentPatreonMember(
    existingPatreon: any,
    patronFullDetails: PatronFullDetails,
    usernameLower: string,
    patreonUserTokens: PatreonUserTokens,
  ): Promise<PatronDetails> {
    // Check payment received to update currentPledgeExpiryDate
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hasPaid =
      patronFullDetails.patronMemberDetails.lastChargeStatus &&
      patronFullDetails.patronMemberDetails.lastChargeStatus === 'Paid' &&
      patronFullDetails.patronMemberDetails.lastChargeDate &&
      patronFullDetails.patronMemberDetails.lastChargeDate > thirtyDaysAgo;

    // Due to limited testing capabilities with Patreon API return results, update below
    // if currentPledgeExpiryDate is an inaccurate measure for when a patron has paid until
    const currentPledgeExpiryDate = hasPaid
      ? patronFullDetails.patronMemberDetails.nextChargeDate
      : null;

    const patreonRecordUpdateDetails = {
      patreonUserId: patronFullDetails.patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: patreonUserTokens.userAccessToken,
      userRefreshToken: patreonUserTokens.userRefreshToken,
      userAccessTokenExpiry: patreonUserTokens.userAccessTokenExpiry,
      amountCents: patronFullDetails.patronMemberDetails.amountCents,
      currentPledgeExpiryDate: currentPledgeExpiryDate,
    };

    if (existingPatreon) {
      // If currentPledgeExpiryDate is earlier than previously set expiry, then do not change
      if (
        existingPatreon.currentPledgeExpiryDate >
        patreonRecordUpdateDetails.currentPledgeExpiryDate
      ) {
        patreonRecordUpdateDetails.currentPledgeExpiryDate =
          existingPatreon.currentPledgeExpiryDate;
      }

      await patreonRecord.findOneAndUpdate(
        {
          proavalonUsernameLower: usernameLower,
        },
        patreonRecordUpdateDetails,
      );
    } else if (hasPaid) {
      // Create new patreonRecord only if hasPaid. Else do not create
      await patreonRecord.create(patreonRecordUpdateDetails);
    }

    return {
      patreonUserId: patronFullDetails.patreonUserId,
      isPledgeActive: !this.hasExpired(currentPledgeExpiryDate),
      amountCents: patronFullDetails.patronMemberDetails.amountCents,
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
