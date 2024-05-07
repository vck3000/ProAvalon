import patreonRecord from '../../models/patreonRecord';
import { PatreonController, PatreonUserTokens } from './patreonController';

interface PatronDetails {
  patreonUserId: string;
  isActivePatron: boolean;
  amountCents: number;
}

export interface IPatreonController {
  getPatreonUserTokens(code: string): Promise<PatreonUserTokens>;
  // TODO-kev: Change the any type
  getPatronDetails(patronAccessToken: string): any;
  getPatreonAuthorizationUrl(): string;
}

export class PatreonAgent {
  private patreonController: IPatreonController;

  constructor(controller: IPatreonController) {
    this.patreonController = controller;
  }

  public getPatreonAuthorizationUrl() {
    return this.patreonController.getPatreonAuthorizationUrl();
  }

  public async getExistingPatronDetails(
    usernameLower: string,
  ): Promise<PatronDetails> {
    // This function is to check for features in general on load

    const patronRecord = await this.getPatronRecord(usernameLower);
    if (!patronRecord) {
      return null;
    }

    const isActivePatron = !this.hasExpired(
      patronRecord.currentPledgeExpiryDate,
    );

    return {
      patreonUserId: patronRecord.patreonUserId,
      isActivePatron: isActivePatron,
      amountCents: patronRecord.amountCents,
    };
  }

  // This path is hit whenever user clicks link to Patreon button
  public async linkUserToPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatronDetails> {
    // Grab user tokens
    const tokens = await this.patreonController.getPatreonUserTokens(code);

    // Grab member details from Patreon with token
    const patronDetails = await this.patreonController.getPatronDetails(
      tokens.userAccessToken,
    );

    // Grab Patreon document from MongoDB
    const existingPatreon = await this.getPatronRecord(usernameLower);

    // Do not let more than one patreon be used for same user
    if (
      existingPatreon &&
      existingPatreon.patreonUserId !== patronDetails.patreonUserId
    ) {
      throw new Error(
        'Attempted to upload a second Patreon for the same user.',
      );
    }

    // Do not let one patreon be used for more than one user
    const patreonAccountInUse = await patreonRecord.findOne({
      patreonUserId: patronDetails.patreonUserId,
    });
    if (
      patreonAccountInUse &&
      patreonAccountInUse.proavalonUsernameLower !== usernameLower
    ) {
      throw new Error(
        'Attempted to upload a used Patreon for more than one user.',
      );
    }

    let result: PatronDetails;

    if (patronDetails.patreonMemberDetails) {
      // They are a current member
      result = await this.updateCurrentPatreonMember(
        existingPatreon,
        patronDetails,
        usernameLower,
        tokens,
      );
    } else {
      // They are not a current member to the Patreon page
      result = await this.updateCurrentNonPatreonMember(
        existingPatreon,
        tokens,
        usernameLower,
        patronDetails.patreonUserId,
      );
    }

    console.log(
      `Successfully linked Patreon account: proavalonUsernameLower="${usernameLower}" patreonUserId="${patronDetails.patreonUserId}" isActivePatreon="${result.isActivePatron}" amountCents="${result.amountCents}"`,
    );

    return result;
  }

  private async updateCurrentPatreonMember(
    existingPatreon: any,
    patronDetails: any,
    usernameLower: string,
    tokens: PatreonUserTokens,
  ): Promise<PatronDetails> {
    const amountCents =
      patronDetails.patreonMemberDetails.currently_entitled_amount_cents;
    const lastChargeDate = new Date(
      patronDetails.patreonMemberDetails.last_charge_date,
    );

    // Check payment received
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hasPaid =
      patronDetails.patreonMemberDetails.last_charge_status &&
      patronDetails.patreonMemberDetails.last_charge_status === 'Paid' &&
      lastChargeDate &&
      lastChargeDate > thirtyDaysAgo;
    const currentPledgeExpiryDate = hasPaid
      ? patronDetails.patreonMemberDetails.next_charge_date
      : null;

    const patreonUpdateDetails = {
      patreonUserId: patronDetails.patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: tokens.userAccessToken,
      userRefreshToken: tokens.userRefreshToken,
      userAccessTokenExpiry: tokens.userAccessTokenExpiry,
      amountCents,
      // TODO-kev: Check this is accurate
      currentPledgeExpiryDate: currentPledgeExpiryDate,
    };

    if (existingPatreon) {
      await patreonRecord.findOneAndUpdate(
        {
          proavalonUsernameLower: usernameLower,
        },
        patreonUpdateDetails,
      );
    } else {
      await patreonRecord.create(patreonUpdateDetails);
    }

    return {
      patreonUserId: patronDetails.patreonUserId,
      isActivePatron: !this.hasExpired(currentPledgeExpiryDate),
      amountCents,
    };
  }

  private async updateCurrentNonPatreonMember(
    existingPatreon: any,
    tokens: PatreonUserTokens,
    usernameLower: string,
    patreonUserId: string,
  ): Promise<PatronDetails> {
    if (existingPatreon) {
      existingPatreon.userAccessToken = tokens.userAccessToken;
      existingPatreon.userRefreshToken = tokens.userRefreshToken;
      existingPatreon.userAccessTokenExpiry = tokens.userAccessTokenExpiry;

      await existingPatreon.save();

      return {
        patreonUserId: existingPatreon.patreonUserId,
        isActivePatron: false,
        amountCents: 0,
      };
    }

    // TODO-kev: Can potentially remove this one so as to not store non member data
    await patreonRecord.create({
      patreonUserId: patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: tokens.userAccessToken,
      userRefreshToken: tokens.userRefreshToken,
      userAccessTokenExpiry: tokens.userAccessTokenExpiry,
      amountCents: 0,
      currentPledgeExpiryDate: null,
    });

    return {
      patreonUserId: existingPatreon.patreonUserId,
      isActivePatron: false,
      amountCents: 0,
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

  private async getPatronRecord(usernameLower: string) {
    const patronRecord = await patreonRecord.findOne({
      proavalonUsernameLower: usernameLower,
    });

    return patronRecord ? patronRecord : null;
  }
}

// TODO-kev: Should we keep a singleton use-case here?
export const patreonAgent = new PatreonAgent(new PatreonController());
