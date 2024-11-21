import { getRequiredProdEnvVariable } from './utils';

export type EmailConfigType = {
  PROAVALON_EMAIL_ADDRESS_DOMAIN?: string;
  PROAVALON_EMAIL_ADDRESS?: string;
  MAILGUN_API_KEY?: string;
};

export const EmailConfig: Readonly<EmailConfigType> = Object.freeze({
  PROAVALON_EMAIL_ADDRESS_DOMAIN: getRequiredProdEnvVariable(
    'PROAVALON_EMAIL_ADDRESS_DOMAIN',
  ),
  PROAVALON_EMAIL_ADDRESS: getRequiredProdEnvVariable(
    'PROAVALON_EMAIL_ADDRESS',
  ),
  MAILGUN_API_KEY: getRequiredProdEnvVariable('MAILGUN_API_KEY'),
});
