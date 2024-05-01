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
      scope: 'identity identity.memberships',
    },
  });

  public async registerPatreon(code: string) {
    const userDetails = await this.getUserDetails(code);
    // await this.getCampaignMembers();
    // await this.getCampaignMembers();
    // await this.memberById();

    // Check if you can find the PatreonId
    // If you cant find it then create one
    // Then link it with the user
    // If you can find it then check if it has expired
    // if not expired then update the details
    // If expired then update
  }

  public async getCreatorCampaign() {
    // const tokens = await this.getTokens(code);
    const url =
      'https://www.patreon.com/api/oauth2/v2/campaigns?fields%5Bmember%5D=full_name,patron_status,will_pay_amount_cents';
    // console.log(tokens.access_token);
    const headers = {
      Authorization: `Bearer ${this.patreonCreatorToken}`,
    };

    const response = await axios.get(url, { headers });

    console.log(response.data);
    return response.data;
  }

  public async getCampaignMembers() {
    // Still have to test if opened from ProNub account. None of the members or campaign info show

    const url = `https://www.patreon.com/api/oauth2/v2/campaigns/${process.env.patreon_campaign}/members`;
    const headers = {
      Authorization: `Bearer ${this.patreonCreatorToken}`,
    };

    const response = await axios.get(url, { headers });

    console.log(response.data);
    return response.data;
  }

  public async memberById() {
    // Still have to test if opened from ProNub account. None of the members or campaign info show

    const url = `https://www.patreon.com/api/oauth2/v2/members/126667873`;
    const headers = {
      Authorization: `Bearer ${this.patreonCreatorToken}`,
    };

    const response = await axios.get(url, { headers });

    console.log(response.data);
    return response.data;
  }

  public async getUserDetails(code: string) {
    const tokens = await this.getTokens(code);
    const url =
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Buser%5D=full_name&fields%5Bmember%5D=lifetime_support_cents';
    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
    };

    const response = await axios.get(url, { headers });

    // const getUserDetailsUrl =
    //   'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Buser%5D=full_name&fields%5Bmember%5D=patron_status,will_pay_amount_cents,campaign_lifetime_support_cents';
    //
    // const response = await axios.get(getUserDetailsUrl, {
    //   headers: {
    //     Authorization: `Bearer ${tokens.access_token}`,
    //   },
    // }

    console.log(response.data);
    const userId = response.data.data.id;
    console.log(userId);

    // const url2 = `https://www.patreon.com/api/oauth2/v2/members/${userId}`;
    // const params2 = {
    //   include: 'currently_entitled_tiers',
    //   fields: {
    //     member: 'full_name',
    //   },
    // };
    // const headers2 = {
    //   Authorization: `Bearer ${this.patreonCreatorToken}`,
    // };
    //
    // // @ts-ignore
    // const response2 = await axios.get(url2, { params2, headers2 });
    //
    // console.log(response2.data);

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

  public async getPatreonQuery(patreonId: string) {
    return PatreonId.findOne({ id: patreonId });
  }
}
