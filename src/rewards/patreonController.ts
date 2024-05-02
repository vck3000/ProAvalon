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
}
