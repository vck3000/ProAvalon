import axios from 'axios';
import patreonId from '../../models/patreonId';
import { PatreonController, PatreonUserTokens } from './patreonController';

interface PatreonDetails {
  isActivePatreon: boolean;
  amountCents: number;
}

class PatreonAgent {
  private patreonController = new PatreonController();

  public getPatreonAuthorizationUrl() {
    return this.patreonController.loginUrl;
  }

  public async getExistingPatreonDetails(
    usernameLower: string,
  ): Promise<PatreonDetails> {
    // This function is to check for features in general on load

    const existingPatreon = await this.getExistingPatreon(usernameLower);

    if (!existingPatreon) {
      return null;
    }

    const isActivePatreon = this.hasNotExpired(
      existingPatreon.currentPledgeExpiryDate,
    );

    return { isActivePatreon, amountCents: existingPatreon.amountCents };
  }

  // This path is hit whenever user clicks link to Patreon button
  public async linkUserToPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatreonDetails> {
    // Grab user tokens
    const tokens = await this.patreonController.getTokens(code);

    // Grab member details from Patreon with token
    const patronDetails = await this.patreonController.getPatronDetails(
      tokens.userAccessToken,
    );

    // Create variables based on member details received
    const patreonUserId = patronDetails.patreonUserId;
    const userAccessToken = tokens.userRefreshToken;
    const userRefreshToken = tokens.userRefreshToken;
    const userAccessTokenExpiry = tokens.userAccessTokenExpiry;
    const existingPatreon = await this.getExistingPatreon(usernameLower);

    // Do not let more than one patreon be used for same user
    if (existingPatreon && existingPatreon.patreonUserId !== patreonUserId) {
      throw new Error(
        'Attempted to upload a second Patreon for the same user.',
      );
    }

    // Do not let one patreon be used for more than one user
    const patreonAccountInUse = await patreonId.findOne({
      patreonUserId: patreonUserId,
    });
    if (
      patreonAccountInUse &&
      patreonAccountInUse.proavalonUsernameLower !== usernameLower
    ) {
      throw new Error(
        'Attempted to upload a used Patreon for more than one user.',
      );
    }

    if (patronDetails.patreonMemberDetails) {
      // THEY ARE A MEMBER
      // Extract all data
      const lastChargeStatus =
        patronDetails.patreonMemberDetails.last_charge_status;
      const nextChargeDate =
        patronDetails.patreonMemberDetails.next_charge_date;
      const amountCents =
        patronDetails.patreonMemberDetails.currently_entitled_amount_cents;
      const lastChargeDate = new Date(
        patronDetails.patreonMemberDetails.last_charge_date,
      );

      // Check payment received
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const hasPaid =
        lastChargeStatus &&
        lastChargeStatus === 'Paid' &&
        lastChargeDate &&
        lastChargeDate > thirtyDaysAgo;
      const currentPledgeExpiryDate = hasPaid ? nextChargeDate : null;

      const patreonUpdateDetails = {
        patreonUserId: patreonUserId,
        proavalonUsernameLower: usernameLower,
        userAccessToken,
        userRefreshToken,
        userAccessTokenExpiry,
        amountCents,
        // TODO-kev: Check this is accurate
        currentPledgeExpiryDate: currentPledgeExpiryDate,
      };

      if (existingPatreon) {
        await patreonId.findOneAndUpdate(
          {
            proavalonUsernameLower: usernameLower,
          },
          patreonUpdateDetails,
        );

        console.log(
          `Updated existing Patreon: patreonUserId=${patreonUserId} inGameUsername=${usernameLower} amountCents=${amountCents} currentPledgeExpiryDate=${currentPledgeExpiryDate}`,
        );
        return {
          isActivePatreon: this.hasNotExpired(currentPledgeExpiryDate),
          amountCents: amountCents,
        };
      } else {
        await patreonId.create(patreonUpdateDetails);
        console.log(
          `Created new Patreon: patreonUserId=${patreonUserId} inGameUsername=${usernameLower} amountCents=${amountCents} currentPledgeExpiryDate=${currentPledgeExpiryDate}`,
        );
        return {
          isActivePatreon: !this.hasNotExpired(currentPledgeExpiryDate),
          amountCents: amountCents,
        };
      }
    } else {
      // They are not a current member to the Patreon page
      return await this.updateCurrentNonPatreonMember(
        existingPatreon,
        tokens,
        usernameLower,
        patreonUserId,
      );
    }
  }

  private async updateCurrentPatreonMember() {}

  private async updateCurrentNonPatreonMember(
    existingPatreon: any,
    tokens: PatreonUserTokens,
    usernameLower: string,
    patreonUserId: number,
  ) {
    if (existingPatreon) {
      existingPatreon.userAccessToken = tokens.userAccessToken;
      existingPatreon.userRefreshToken = tokens.userRefreshToken;
      existingPatreon.userAccessTokenExpiry = tokens.userAccessTokenExpiry;

      await existingPatreon.save();
      console.log(
        `Updated existing Patreon. Not a member: patreonUserId=${patreonUserId} inGameUsername=${usernameLower}`,
      );
      return { isActivePatreon: false, amountCents: 0 };
    }

    // TODO-kev: Can potentially remove this one so as to not store non member data
    await patreonId.create({
      patreonUserId: patreonUserId,
      proavalonUsernameLower: usernameLower,
      userAccessToken: tokens.userAccessToken,
      userRefreshToken: tokens.userRefreshToken,
      userAccessTokenExpiry: tokens.userAccessTokenExpiry,
      amountCents: 0,
      currentPledgeExpiryDate: null,
    });

    console.log(
      `Created new Patreon. Not a member: patreonUserId=${patreonUserId} inGameUsername=${usernameLower}`,
    );
    return { isActivePatreon: false, amountCents: 0 };
  }

  private hasNotExpired(expiryDate: Date) {
    return expiryDate > new Date();
  }

  private async getExistingPatreon(usernameLower: string) {
    const existingPatreon = await patreonId.findOne({
      proavalonUsernameLower: usernameLower,
    });

    return existingPatreon ? existingPatreon : null;
  }
}

export const patreonAgent = new PatreonAgent();
