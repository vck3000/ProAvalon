import axios from 'axios';
import patreonId from '../models/patreonId';

interface PatreonDetails {
  isActivePatreon: boolean;
  amountCents: number;
}

class PatreonAgent {
  private clientId = process.env.patreon_client_ID;
  private clientSecret = process.env.patreon_client_secret;
  private redirectUri = process.env.patreon_redirectURL;
  public loginUrl: string;

  constructor() {
    const url = new URL('https://www.patreon.com/oauth2/authorize');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: 'chill', // TODO-kev: Is this needed?
      scope: 'identity',
    });
    url.search = params.toString();

    this.loginUrl = url.href;
  }

  // This path is hit whenever user clicks link to Patreon button
  public async registerPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatreonDetails> {
    // Check if existing Patreon
    const existingPatreonDetails = await this.getExistingPatreonDetails(
      usernameLower,
    );
    if (existingPatreonDetails && existingPatreonDetails.isActivePatreon) {
      // If existing Patreon, and is still active then exit
      console.log(
        `Active patreon already exists locally: user=${usernameLower}, active=${existingPatreonDetails.isActivePatreon}, amountCents=${existingPatreonDetails.amountCents}`,
      );
      return existingPatreonDetails;
    }

    return await this.updateUserPatreon(usernameLower, code);
  }

  public async updateUserPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatreonDetails> {
    // Grab user tokens
    const tokens = await this.getTokens(code);

    // Grab member details with token
    const url = new URL('https://www.patreon.com/api/oauth2/v2/identity');
    const params = new URLSearchParams({
      include: 'memberships',
      'fields[member]':
        'last_charge_status,next_charge_date,last_charge_date,currently_entitled_amount_cents',
    });
    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
    };
    url.search = params.toString();

    const response = await axios.get(url.href, { headers });

    // Update based on member details received
    const patreonUserId = response.data.data.id;
    const userAccessToken = tokens.access_token;
    const userRefreshToken = tokens.refresh_token;
    const userAccessTokenExpiry = new Date(
      Date.now() + tokens.expires_in * 1000,
    );

    // Do not let more than one patreon for same user
    const existingPatreon = await this.getExistingPatreon(usernameLower);

    if (existingPatreon && existingPatreon.userId !== patreonUserId) {
      throw new Error(
        'Attempted to upload a second Patreon for the same user.',
      );
    }

    if (response.data.included) {
      // THEY ARE A MEMBER

      if (response.data.included.length !== 1) {
        // TODO-kev: Will need to test this. What happens if a user upgrades their plan? Member multiple?
        // Only one membership allowed. Unexpected behaviour if more than one membership
        throw new Error(
          `Unexpected number of Patreon memberships received. user=${usernameLower} memberships="${response.data.included}."`,
        );
      }

      const patreonMemberDetails = response.data.included[0].attributes;

      // Extract all data
      const lastChargeStatus = patreonMemberDetails.last_charge_status;
      const nextChargeDate = patreonMemberDetails.next_charge_date;
      const amountCents = patreonMemberDetails.currently_entitled_amount_cents;
      const lastChargeDate = new Date(patreonMemberDetails.last_charge_date);

      // Check payment received
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const hasPaid =
        lastChargeStatus &&
        lastChargeStatus === 'Paid' &&
        lastChargeDate &&
        lastChargeDate > thirtyDaysAgo;
      const pledgeExpiryDate = hasPaid ? nextChargeDate : null;

      const patreonUpdateDetails = {
        userId: patreonUserId,
        inGameUsernameLower: usernameLower,
        userAccessToken,
        userRefreshToken,
        userAccessTokenExpiry,
        amountCents,
        // TODO-kev: Check this is accurate
        pledgeExpiryDate: pledgeExpiryDate,
      };

      if (existingPatreon) {
        await patreonId.findOneAndUpdate(
          {
            inGameUsernameLower: usernameLower,
          },
          patreonUpdateDetails,
        );

        console.log(
          `Updated existing Patreon: userId=${patreonUserId} inGameUsername=${usernameLower} amountCents=${amountCents} pledgeExpiryDate=${pledgeExpiryDate}`,
        );
        return {
          isActivePatreon: this.hasNotExpired(pledgeExpiryDate),
          amountCents: amountCents,
        };
      } else {
        await patreonId.create(patreonUpdateDetails);
        console.log(
          `Created new Patreon: userId=${patreonUserId} inGameUsername=${usernameLower} amountCents=${amountCents} pledgeExpiryDate=${pledgeExpiryDate}`,
        );
        return {
          isActivePatreon: !this.hasNotExpired(pledgeExpiryDate),
          amountCents: amountCents,
        };
      }
    } else {
      // They are not a current member to the Patreon page

      // Update the tokens if they have an exisiting patreon account
      if (existingPatreon) {
        existingPatreon.userAccessToken = userAccessToken;
        existingPatreon.userRefreshToken = userRefreshToken;
        existingPatreon.userAccessTokenExpiry = userAccessTokenExpiry;

        await existingPatreon.save();
        console.log(
          `Updated existing Patreon. Not a member: userId=${patreonUserId} inGameUsername=${usernameLower}`,
        );
        return { isActivePatreon: false, amountCents: 0 };
      }

      if (!existingPatreon) {
        await patreonId.create({
          userId: patreonUserId,
          inGameUsernameLower: usernameLower,
          userAccessToken,
          userRefreshToken,
          userAccessTokenExpiry,
          amountCents: 0,
          pledgeExpiryDate: null,
        });
        // TODO-kev: Can potentially remove this one
        console.log(
          `Created new Patreon. Not a member: userId=${patreonUserId} inGameUsername=${usernameLower}`,
        );
        return { isActivePatreon: false, amountCents: 0 };
      }
    }
  }

  private hasNotExpired(expiryDate: Date) {
    return expiryDate > new Date();
  }

  private async getTokens(code: string) {
    const getTokensUrl = new URL('https://www.patreon.com/api/oauth2/token');
    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });
    getTokensUrl.search = params.toString();

    const response = await axios.post(getTokensUrl.href);

    // respose.data format:
    // {
    //   "access_token": <single use token>,
    //   "refresh_token": <single use token>,
    //   "expires_in": <token lifetime duration>,
    //   "scope": <token scopes>,
    //   "token_type": "Bearer"
    // }

    return response.data;
  }

  private async getExistingPatreon(usernameLower: string) {
    const existingPatreon = await patreonId.findOne({
      inGameUsernameLower: usernameLower,
    });

    return existingPatreon ? existingPatreon : null;
  }

  private async getExistingPatreonDetails(
    usernameLower: string,
  ): Promise<PatreonDetails> {
    // This function is to check for features in general on load

    const existingPatreon = await this.getExistingPatreon(usernameLower);

    if (!existingPatreon) {
      return null;
    }

    const isActivePatreon = this.hasNotExpired(
      existingPatreon.pledgeExpiryDate,
    );

    return { isActivePatreon, amountCents: existingPatreon.amountCents };
  }
}

export const patreonAgent = new PatreonAgent();
