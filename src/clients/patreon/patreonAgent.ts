import patreonRecord from '../../models/patreonRecord';

export interface PatreonUserTokens {
  userAccessToken: string;
  userRefreshToken: string;
  userAccessTokenExpiry: Date;
}

export interface PaidPatronDetails {
  patreonUserId: string;
  amountCents: number;
  currentPledgeExpiryDate: Date;
}

export interface IPatreonController {
  getPatreonUserTokens(code: string): Promise<PatreonUserTokens>;
  getPaidPatronDetails(patronAccessToken: string): Promise<PaidPatronDetails>;
  getLoginUrl(): string;
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
    const paidPatronDetails = await this.patreonController.getPaidPatronDetails(
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
        paidPatronDetails.patreonUserId
    ) {
      throw new MultiplePatreonsForUserError();
    }

    // Do not let one patreon be used for more than one user
    const existingPatreonRecordForOtherUser =
      await this.getPatreonRecordFromPatreonId(paidPatronDetails.patreonUserId);

    if (
      existingPatreonRecordForOtherUser &&
      existingPatreonRecordForOtherUser.proavalonUsernameLower !== usernameLower
    ) {
      throw new MultipleUsersForPatreonError();
    }

    if (paidPatronDetails) {
      const result = await this.updateCurrentPatreonMember(
        existingPatreonRecordForUser,
        paidPatronDetails,
        usernameLower,
        patreonUserTokens,
      );

      console.log(
        `Successfully linked Patreon account: proavalonUsernameLower="${usernameLower}" patreonUserId="${paidPatronDetails.patreonUserId}" isPledgeActive="${result.isPledgeActive}" amountCents="${result.amountCents}"`,
      );

      return result;
    } else {
      if (existingPatreonRecordForUser) {
        await this.unlinkPatreon(
          existingPatreonRecordForUser.proavalonUsernameLower,
        );
      }

      return {
        patreonUserId: paidPatronDetails.patreonUserId,
        isPledgeActive: false,
        amountCents: 0,
      };
    }
  }

  private async updateCurrentPatreonMember(
    existingPatreonRecord: any,
    paidPatronDetails: PaidPatronDetails,
    usernameLower: string,
    patreonUserTokens: PatreonUserTokens,
  ): Promise<PatronDetails> {
    const patreonRecordUpdateDetails = {
      patreonUserId: paidPatronDetails.patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: patreonUserTokens.userAccessToken,
      userRefreshToken: patreonUserTokens.userRefreshToken,
      userAccessTokenExpiry: patreonUserTokens.userAccessTokenExpiry,
      amountCents: paidPatronDetails.amountCents,
      currentPledgeExpiryDate: paidPatronDetails.currentPledgeExpiryDate,
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
      patreonUserId: paidPatronDetails.patreonUserId,
      isPledgeActive: !this.hasExpired(
        paidPatronDetails.currentPledgeExpiryDate,
      ),
      amountCents: paidPatronDetails.amountCents,
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
