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

  public async registerPatreon(
    usernameLower: string,
    code: string,
  ): Promise<PatreonDetails> {
    // This path is hit whenever user clicks link to Patreon button

    const userDetails = await this.getUserDetails(usernameLower, code);

    return { isActivePatreon: false, amountCents: 0 };

    // Check if you can find the PatreonId
    // If you cant find it then create one
    // Then link it with the user
    // If you can find it then check if it has expired
    // if not expired then update the details
    // If expired then update
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

  // public async getCreatorCampaign() {
  //   // const tokens = await this.getTokens(code);
  //   const url =
  //     'https://www.patreon.com/api/oauth2/v2/campaigns?fields%5Bmember%5D=full_name,patron_status,will_pay_amount_cents&fields%5Btier%5D=description,title,patron_count';
  //   // console.log(tokens.access_token);
  //   const headers = {
  //     Authorization: `Bearer ${this.patreonCreatorToken}`,
  //   };
  //
  //   const response = await axios.get(url, { headers });
  //
  //   console.log(response.data);
  //   return response.data;
  // }
  //
  // public async getCampaignMembers() {
  //   // Still have to test if opened from ProNub account. None of the members or campaign info show
  //
  //   const url = `https://www.patreon.com/api/oauth2/v2/campaigns/${process.env.patreon_campaign}/members?include=currently_entitled_tiers`;
  //   const headers = {
  //     Authorization: `Bearer ${this.patreonCreatorToken}`,
  //   };
  //
  //   const response = await axios.get(url, { headers });
  //
  //   console.log(response.data);
  //   return response.data;
  // }
  //
  // public async memberById() {
  //   // Still have to test if opened from ProNub account. None of the members or campaign info show
  //
  //   const url = `https://www.patreon.com/api/oauth2/v2/members/126667873`;
  //   const headers = {
  //     Authorization: `Bearer ${this.patreonCreatorToken}`,
  //   };
  //
  //   const response = await axios.get(url, { headers });
  //
  //   console.log(response.data);
  //   return response.data;
  // }

  public async getUserDetails(usernameLower: string, code: string) {
    // TODO-kev: Need to move this. Its required temporarily to not create separate Patreon entries for same user
    const existingPat = await this.getExistingActivePatreonDetails(
      usernameLower,
    );
    if (existingPat) {
      console.log(existingPat);
      return;
    }

    const tokens = await this.getTokens(code);
    const url =
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships,memberships.currently_entitled_tiers&fields%5Bmember%5D=last_charge_status,next_charge_date,pledge_relationship_start&fields%5Btier%5D=amount_cents';
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

    let amountCents: number = -1;
    let lastChargeStatus: string = 'test';
    let nextChargeDate: Date = new Date();
    let pledgeRelationshipStart: Date = new Date();

    if (response.data.included) {
      if (
        response.data.included.length >= 1 &&
        response.data.included.length <= 2
      ) {
        // THEY ARE A MEMBER
        const patreonMemberDetails = response.data.included[0].attributes;
        const patreonTierDetails = response.data.included[1].attributes;

        lastChargeStatus = patreonMemberDetails.last_charge_status;
        nextChargeDate = patreonMemberDetails.next_charge_date;
        pledgeRelationshipStart =
          patreonMemberDetails.pledge_relationship_start;
        amountCents = patreonTierDetails.amount_cents;

        await PatreonId.create({
          userId: patreonUserId,
          inGameUsernameLower: usernameLower,
          userAccessToken,
          userRefreshToken,
          userAccessTokenExpiry,
          amountCents,
          // TODO-kev: Check this is accurate
          pledgeExpiryDate: nextChargeDate,
        });
      } else if (response.data.included.length > 2) {
        // TODO-kev: Will need to test this. What happens if a user upgrades their plan?
        throw new Error(
          `Unexpected number of Patreon memberships received. name="" memberships="${response.data.included}"`,
        );
      }
    } else {
      await PatreonId.create({
        userId: patreonUserId,
        inGameUsernameLower: usernameLower,
        userAccessToken,
        userRefreshToken,
        userAccessTokenExpiry,
        amountCents: 0,
        // TODO-kev: Check this is accurate
        pledgeExpiryDate: null,
      });
    }

    // TODO-kev: Design decision on when a patron is considered a valid patron? When they paid etc

    console.log('====================');
    console.log(`patreonUserId: ${patreonUserId}`);
    console.log(`userAccessToken: ${userAccessToken}`);
    console.log(`lastChargeStatus: ${lastChargeStatus}`);
    console.log(`userAccessTokenExpiry: ${userAccessTokenExpiry}`);
    console.log(`nextChargeDate: ${nextChargeDate}`);
    console.log(`pledgeRelationshipStart: ${pledgeRelationshipStart}`);
    console.log(`amountCents: ${amountCents}`);
    console.log('====================');

    return response.data;
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
