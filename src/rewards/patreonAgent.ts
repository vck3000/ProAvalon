import url from 'url';
import axios from 'axios';
import patreonId from '../models/patreonId';
import PatreonId from '../models/patreonId';
import user from '../models/user';

interface PatreonDetails {
  isActivePatreon: boolean;
  amountCents: number;
}

export class PatreonAgent {
  private clientId = process.env.patreon_client_ID;
  private redirectUri = process.env.patreon_redirectURL;
  private patreonCreatorToken = process.env.patreon_creator_access_token;

  public loginUrl = url.format({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: 'chill', // TODO-kev: Is this needed?
      scope: 'identity',
    },
  });

  // This path is hit whenever user clicks link to Patreon button
  public async registerPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatreonDetails> {
    // Check if existing Patreon
    // TODO-kev: Need to move this. Its required temporarily to not create separate Patreon entries for same user. Also note the user token will change
    const existingPat = await this.getExistingActivePatreonDetails(
      usernameLower,
    );
    // if (existingPat && existingPat.isActivePatreon) {
    //   // If existing Patreon, and is still active then exit
    //   console.log(existingPat);
    //   return existingPat;
    // }

    // Consider need to update if isnotactivepatreon

    await this.updateUserPatreon(usernameLower, code);

    return { isActivePatreon: false, amountCents: 0 };
  }

  private async getExistingActivePatreonDetails(
    usernameLower: string,
  ): Promise<PatreonDetails> {
    // This function is to check for features in general on load

    const patreonQuery = await patreonId.findOne({
      in_game_username: usernameLower,
    });

    if (!patreonQuery) {
      return null;
    }

    const isActivePatreon = patreonQuery.pledgeExpiryDate > new Date();

    return { isActivePatreon, amountCents: patreonQuery.amountCents };
  }

  private async getExistingPatreon(usernameLower: string) {
    const existingPatreon = await patreonId.findOne({
      inGameUsernameLower: usernameLower,
    });

    return existingPatreon ? existingPatreon : null;
  }

  public async updateUserPatreon(usernameLower: string, code: string) {
    const tokens = await this.getTokens(code);
    const url =
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Bmember%5D=last_charge_status,next_charge_date,last_charge_date,currently_entitled_amount_cents';
    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
    };

    const response = await axios.get(url, { headers });

    const patreonUserId = response.data.data.id;
    const userAccessToken = tokens.access_token;
    const userRefreshToken = tokens.refresh_token;
    const userAccessTokenExpiry = new Date(
      Date.now() + tokens.expires_in * 1000,
    );

    const existingPatreon = await this.getExistingPatreon(usernameLower);

    if (existingPatreon && existingPatreon.userId !== patreonUserId) {
      throw new Error('Attempted to upload duplicate Patreon error');
    }

    if (response.data.included) {
      // THEY ARE A MEMBER

      if (response.data.included.length !== 1) {
        // TODO-kev: Will need to test this. What happens if a user upgrades their plan? Member multiple?
        throw new Error(
          `Unexpected number of Patreon memberships received. name="" memberships="${response.data.included}"`,
        );
      }

      // Only one membership
      const patreonMemberDetails = response.data.included[0].attributes;

      // Extract all data
      const lastChargeStatus = patreonMemberDetails.last_charge_status;
      const nextChargeDate = patreonMemberDetails.next_charge_date;
      const amountCents = patreonMemberDetails.currently_entitled_amount_cents;
      const lastChargeDate = new Date(patreonMemberDetails.last_charge_date);

      console.log('====================');
      console.log(`lastChargeStatus: ${lastChargeStatus}`);
      console.log(`nextChargeDate: ${nextChargeDate}`);
      console.log(`amountCents: ${amountCents}`);
      console.log(`lastChargeDate: ${lastChargeDate}`);
      console.log('====================');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const hasPaid =
        lastChargeStatus &&
        lastChargeStatus === 'Paid' &&
        lastChargeDate &&
        lastChargeDate > thirtyDaysAgo;

      const patreonUpdateDetails = {
        userId: patreonUserId,
        inGameUsernameLower: usernameLower,
        userAccessToken,
        userRefreshToken,
        userAccessTokenExpiry,
        amountCents,
        // TODO-kev: Check this is accurate
        pledgeExpiryDate: hasPaid ? nextChargeDate : null,
      };

      if (existingPatreon) {
        await patreonId.findOneAndUpdate(
          {
            inGameUsernameLower: usernameLower,
          },
          patreonUpdateDetails,
        );
      } else {
        await PatreonId.create(patreonUpdateDetails);
      }
    } else {
      if (existingPatreon) {
        existingPatreon.userAccessToken = userAccessToken;
        existingPatreon.userRefreshToken = userRefreshToken;
        existingPatreon.userAccessTokenExpiry = userAccessTokenExpiry;

        await existingPatreon.save();
      }

      if (!existingPatreon) {
        await PatreonId.create({
          userId: patreonUserId,
          inGameUsernameLower: usernameLower,
          userAccessToken,
          userRefreshToken,
          userAccessTokenExpiry,
          amountCents: 0,
          pledgeExpiryDate: null,
        });
      }
    }

    console.log('====================');
    console.log(`patreonUserId: ${patreonUserId}`);
    console.log(`userAccessToken: ${userAccessToken}`);
    console.log(`userAccessTokenExpiry: ${userAccessTokenExpiry}`);
    console.log('====================');
  }

  private async getTokens(code: string) {
    const getTokensUrl = url.format({
      protocol: 'https',
      host: 'patreon.com',
      pathname: '/api/oauth2/token',
      query: {
        code: code,
        grant_type: 'authorization_code',
        client_id: process.env.patreon_client_ID,
        client_secret: process.env.patreon_client_secret,
        redirect_uri: process.env.patreon_redirectURL,
      },
    });

    const response = await axios.post(getTokensUrl);

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
}
