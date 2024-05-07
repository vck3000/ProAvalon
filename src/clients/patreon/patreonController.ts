import { PATREON_URLS } from './constants';
import {
  IPatreonController,
  PatreonUserTokens,
  PatronFullDetails,
} from './patreonAgent';
import uuid from 'uuid';

export class PatreonController implements IPatreonController {
  private clientId = process.env.patreon_client_ID;
  private clientSecret = process.env.patreon_client_secret;
  private redirectUri = process.env.patreon_redirectURL;

  public async getPatreonUserTokens(code: string): Promise<PatreonUserTokens> {
    const getPatreonUserTokensUrl = new URL(PATREON_URLS.GET_TOKENS);
    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });
    getPatreonUserTokensUrl.search = params.toString();

    const response = await fetch(getPatreonUserTokensUrl.href, {
      method: 'POST',
    });
    const data = await response.json();

    return {
      userAccessToken: data.access_token,
      userRefreshToken: data.refresh_token,
      userAccessTokenExpiry: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  public async getPatronFullDetails(
    patronAccessToken: string,
  ): Promise<PatronFullDetails> {
    const url = new URL(PATREON_URLS.GET_PATRON_DETAILS);
    const params = new URLSearchParams({
      include: 'memberships',
      'fields[member]':
        'last_charge_date,last_charge_status,next_charge_date,currently_entitled_amount_cents',
    });
    const headers = {
      Authorization: `Bearer ${patronAccessToken}`,
    };
    url.search = params.toString();

    const response = await fetch(url.href, { headers });

    const data = await response.json();
    if (data.included && data.included.length !== 1) {
      // TODO-kev: Will need to test this. What happens if a user upgrades their plan? Member multiple?
      // Only one membership allowed. Unexpected behaviour if more than one membership
      throw new Error(
        `Unexpected number of Patreon memberships received: patreonUserId=${data.data.id} memberships="${data.included}."`,
      );
    }

    return {
      patreonUserId: data.data.id,
      patronMemberDetails: data.included
        ? {
            lastChargeDate: new Date(
              data.included[0].attributes.last_charge_date,
            ),
            lastChargeStatus: data.included[0].attributes.last_charge_status,
            nextChargeDate: new Date(
              data.included[0].attributes.next_charge_date,
            ),
            currentlyEntitledAmountCents:
              data.included[0].attributes.currently_entitled_amount_cents,
          }
        : null,
    };
  }

  public getPatreonAuthorizationUrl() {
    const loginUrl = new URL(PATREON_URLS.AUTHORIZATION_LINK);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: this.generateRandomState(),
      scope: 'identity',
    });

    loginUrl.search = params.toString();

    return loginUrl.href;
  }

  private generateRandomState() {
    const state = uuid.v4();
    return encodeURIComponent(encodeURIComponent(state));
  }
}
