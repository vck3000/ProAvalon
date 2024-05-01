import url from 'url';
import axios from 'axios';
import PatreonId from '../models/patreonId';

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

  public async registerPatreon(code: string) {
    const userDetails = await this.getUserDetails(code);

    // Check if you can find the PatreonId
    // If you cant find it then create one
    // Then link it with the user
    // If you can find it then check if it has expired
    // if not expired then update the details
    // If expired then update
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

  public async getUserDetails(code: string) {
    const tokens = await this.getTokens(code);
    // TODO-kev: Do we want their email instead of url and even name?
    const url =
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships,memberships.currently_entitled_tiers&fields%5Buser%5D=full_name&fields%5Bmember%5D=lifetime_support_cents,patron_status,campaign_lifetime_support_cents&fields%5Btier%5D=title';
    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
    };

    const response = await axios.get(url, { headers });

    const patreonId = response.data.data.id;
    const fullName = response.data.data.attributes.full_name;
    const userAccessToken = tokens.access_token;
    const userAccessTokenExpiry = tokens.expires_in;
    let currentTier = '';
    let patreonStatus = null;
    let patreonTotalCents = 0;

    if (response.data.included) {
      if (
        response.data.included.length >= 1 &&
        response.data.included.length <= 2
      ) {
        const patreonMemberDetails = response.data.included[0].attributes;
        const patreonTierDetails = response.data.included[1].attributes;

        patreonStatus = patreonMemberDetails.patron_status;
        patreonTotalCents =
          patreonMemberDetails.campaign_lifetime_support_cents;
        currentTier = patreonTierDetails.title;
      } else if (response.data.included.length > 2) {
        // TODO-kev: Will need to test this. What happens if a user upgrades their plan?
        throw new Error(
          `Unexpected number of Patreon memberships received. name="${fullName}" memberships="${response.data.included}"`,
        );
      }
    }

    // TODO-kev: Design decision on when a patron is considered a valid patron? When they paid etc

    console.log('====================');
    console.log(`patreonId: ${patreonId}`);
    console.log(`fullName: ${fullName}`);
    console.log(`userAccessToken: ${userAccessToken}`);
    console.log(`userAccessTokenExpiry: ${userAccessTokenExpiry}`);
    console.log(`currentTier: ${currentTier}`);
    console.log(`patreonStatus: ${patreonStatus}`);
    console.log(`patreonTotalCents: ${patreonTotalCents}`);
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
