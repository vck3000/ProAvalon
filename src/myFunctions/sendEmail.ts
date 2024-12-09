import Mailgun from 'mailgun.js';
import formData from 'form-data';

import { config } from '../config';

const api_key = config.email.MAILGUN_API_KEY;
const domain = config.email.PROAVALON_EMAIL_ADDRESS_DOMAIN;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: api_key });

export const sendEmail = (
  recipientEmail: string,
  subject: string,
  messageHtml: string,
) => {
  const data = {
    from: 'ProAvalon <' + config.email.PROAVALON_EMAIL_ADDRESS + '>',
    to: recipientEmail,
    subject: subject,
    html: messageHtml,
  };

  mg.messages.create(domain, data);
};
