import {
  IPatreonController,
  PatreonUserTokens,
  PaidPatronDetails,
} from './patreonAgent';
import uuid from 'uuid';

const PATREON_URLS = {
  AUTHORIZATION_LINK: 'https://www.patreon.com/oauth2/authorize',
  GET_TOKENS: 'https://www.patreon.com/api/oauth2/token',
  GET_PATRON_DETAILS: 'https://www.patreon.com/api/oauth2/v2/identity',
};

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

  public async getPaidPatronFullDetails(
    patronAccessToken: string,
  ): Promise<PaidPatronDetails> {
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

    if (data.included && data.included.length !== 1) {
      // TODO-kev: Will need to test this. What happens if a user upgrades their plan? Member multiple?
      // Only one membership allowed. Unexpected behaviour if more than one membership
      throw new Error(
        `Unexpected number of Patreon memberships received: patreonUserId=${data.data.id} memberships="${data.included}."`,
      );
    }

    const memberData = data.included[0].attributes;
    const lastChargeDate = new Date(memberData.last_charge_date);

    // Check payment received to update currentPledgeExpiryDate
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hasPaid =
      memberData.last_charge_status === 'Paid' &&
      lastChargeDate > thirtyDaysAgo;

    if (!hasPaid) {
      return null;
    }

    // The below code assumes that the nextChargeDate is how long their pledge is valid for.
    // It is difficult to know, even through testing, how Patreon's API really behaves.
    const currentPledgeExpiryDate = memberData.next_charge_date;

    return {
      patreonUserId: data.data.id,
      amountCents: memberData.currently_entitled_amount_cents,
      currentPledgeExpiryDate,
    };
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
