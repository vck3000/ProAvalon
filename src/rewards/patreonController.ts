import axios from 'axios';

export class PatreonController {
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

  public async getTokens(code: string) {
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

    // Result of respose.data:
    // {
    //   "access_token": <single use token>,
    //   "refresh_token": <single use token>,
    //   "expires_in": <token lifetime duration>,
    //   "scope": <token scopes>,
    //   "token_type": "Bearer"
    // }

    return response.data;
  }

  public async getPatronDetails(accessToken: string) {
    const url = new URL('https://www.patreon.com/api/oauth2/v2/identity');
    const params = new URLSearchParams({
      include: 'memberships',
      'fields[member]':
        'last_charge_status,next_charge_date,last_charge_date,currently_entitled_amount_cents',
    });
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    url.search = params.toString();

    const response = await axios.get(url.href, { headers });

    if (response.data.included && response.data.included.length !== 1) {
      // TODO-kev: Will need to test this. What happens if a user upgrades their plan? Member multiple?
      // Only one membership allowed. Unexpected behaviour if more than one membership
      throw new Error(
        `Unexpected number of Patreon memberships received: patreonUserId=${response.data.data.id} memberships="${response.data.included}."`,
      );
    }

    return {
      patreonUserId: response.data.data.id,
      patreonMemberDetails: response.data.included
        ? response.data.included[0].attributes
        : null,
    };
  }
}
