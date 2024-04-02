import Mailgun from 'mailgun.js';
import formData from 'form-data';

const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: api_key });

export const sendEmail = (
  recipientEmail: string,
  subject: string,
  message: string,
) => {
  const data = {
    from: 'ProAvalon <' + process.env.PROAVALON_EMAIL_ADDRESS + '>',
    to: recipientEmail,
    subject: subject,
    html: message,
  };

  mg.messages.create(domain, data);
};
