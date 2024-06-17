import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { config } from '../config/config';

const api_key = config.getMailgunApiKey();
const domain = config.getProAvalonEmailAddressDomain();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: api_key });

export const sendEmail = (
  recipientEmail: string,
  subject: string,
  messageHtml: string,
) => {
  const data = {
    from: 'ProAvalon <' + config.getProAvalonEmailAddress() + '>',
    to: recipientEmail,
    subject: subject,
    html: messageHtml,
  };

  mg.messages.create(domain, data);
};
