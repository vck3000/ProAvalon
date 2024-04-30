import url from 'url';
import axios from 'axios';
import PatreonId from '../models/patreonId';

export class PatreonAgent {
  private clientId = process.env.patreon_client_ID;
  private redirectUri = process.env.patreon_redirectURL;

  public loginUrl = url.format({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: 'chill', // TODO-kev: Is this needed?
      scope: 'identity campaigns.members',
    },
  });

  public async registerPatreon(code: string) {
    const userDetails = await this.getUserDetails(code);
    console.log(userDetails);

    // Check if you can find the PatreonId
    // If you cant find it then create one
    // Then link it with the user
    // If you can find it then check if it has expired
    // if not expired then update the details
    // If expired then update
  }

  public async getUserDetails(code: string) {
    const tokens = await this.getTokens(code);
    const getUserDetailsUrl =
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Buser%5D=full_name&fields%5Bmember%5D=patron_status,will_pay_amount_cents,campaign_lifetime_support_cents';

    const response = await axios.get(getUserDetailsUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

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
