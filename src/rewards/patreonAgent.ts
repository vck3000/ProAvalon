import url from 'url';
import axios from 'axios';
import PatreonId from '../models/patreonId';

export class PatreonAgent {
  public loginUrl = url.format({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
      response_type: 'code',
      client_id: process.env.patreon_client_ID,
      redirect_uri: process.env.patreon_redirectURL,
      state: 'chill', // TODO-kev: Is this needed?
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
    const getUserUrl = 'https://www.patreon.com/api/oauth2/api/current_user';

    const response = await axios.get(getUserUrl, {
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
