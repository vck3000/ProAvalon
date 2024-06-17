import {
  IPatreonController,
  PatreonUserTokens,
  PaidPatronFullDetails,
} from './patreonAgent';
import uuid from 'uuid';dd .
import { config } from '../../config/config';

const PATREON_URLS = {
  AUTHORIZATION_LINK: 'https://www.patreon.com/oauth2/authorize',
  GET_TOKENS: 'https://www.patreon.com/api/oauth2/token',
  GET_PATRON_DETAILS: 'https://www.patreon.com/api/oauth2/v2/identity',
};

export class PatreonController implements IPatreonController {
  private clientId = config.patreon.clientId;
  private clientSecret = config.patreon.clientSecret;
  private redirectUri = config.patreon.redirectUrl;

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

  public async refreshPatreonUserTokens(
    refreshToken: string,
  ): Promise<PatreonUserTokens> {
    const refreshPatreonUserTokensUrl = new URL(PATREON_URLS.GET_TOKENS);
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });
    refreshPatreonUserTokensUrl.search = params.toString();

    const response = await fetch(refreshPatreonUserTokensUrl.href, {
      method: 'POST',
    });
    const data = await response.json();

    return {
      userAccessToken: data.access_token,
      userRefreshToken: data.refresh_token,
      userAccessTokenExpiry: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  public async getPaidPatronFullDetails(
    patronAccessToken: string,
  ): Promise<PaidPatronFullDetails> {
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
    if (!data.included) {
      // They are not a member on Patreon
      return null;
    }

    if (data.included.length !== 1) {
      // The below code assumes that the Patreon account of the server only has one active
      // campaign. It also assumes that the Patreon API will always, at most, send back one
      // membership/pledge per user, even if users change their pledge.
      throw new Error(
        `Unexpected number of Patreon memberships received: patreonUserId=${data.data.id} memberships="${data.included}."`,
      );
    }

    const memberData = data.included[0].attributes;
    const lastChargeDate = new Date(memberData.last_charge_date);

    // Check payment received to update currentPledgeExpiryDate
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const hasPaid =
      memberData.last_charge_status === 'Paid' &&
      lastChargeDate > thirtyOneDaysAgo;

    return hasPaid
      ? {
          patreonUserId: data.data.id,
          amountCents: memberData.currently_entitled_amount_cents,
          // The below code assumes that the nextChargeDate is how long their pledge is valid for.
          // It is difficult to know, even through testing, how Patreon's API really behaves.
          currentPledgeExpiryDate: memberData.next_charge_date,
        }
      : null;
  }

  public getLoginUrl() {
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
    return uuid.v4().replace(/-/g, '');
  }
}
