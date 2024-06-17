export type EmailConfigType = {
  PROAVALON_EMAIL_ADDRESS_DOMAIN?: string;
  PROAVALON_EMAIL_ADDRESS?: string;
  MAILGUN_API_KEY?: string;
};

export const EmailConfig: Readonly<EmailConfigType> = Object.freeze({
  PROAVALON_EMAIL_ADDRESS_DOMAIN: process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN,
  PROAVALON_EMAIL_ADDRESS: process.env.PROAVALON_EMAIL_ADDRESS,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
});
