export type EmailConfigType = {
  proAvalonEmailAddressDomain: string;
  proAvalonEmailAddress: string;
  mailgunApiKey: string;
};

export const EmailConfig: Readonly<EmailConfigType> = Object.freeze({
  proAvalonEmailAddressDomain: process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN,
  proAvalonEmailAddress: process.env.PROAVALON_EMAIL_ADDRESS,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
});
