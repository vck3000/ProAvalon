import ejs from 'ejs';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import emailTemplate from './emailTemplate';
import uuid from 'uuid';
import disposableEmails from '../util/disposableEmails.js';

const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
const server_domain = process.env.SERVER_DOMAIN;

// @ts-ignore
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: api_key });

const uuidv4 = uuid.v4;

export const sendEmailVerification = (user: any, email: string) => {
  if (user.emailVerified === true) {
    // Don't send an email if the user is already verified...
    return;
  }
  if (email) {
    email = email.toLowerCase();
    user.emailAddress = email;
    user.markModified('emailAddress');
  }

  const token = uuidv4();

  const message = ejs.render(emailTemplate, { server_domain, token });

  const data = {
    from: 'ProAvalon <' + process.env.PROAVALON_EMAIL_ADDRESS + '>',
    to: user.emailAddress,
    subject: 'Welcome! Please verify your email address.',
    html: message,
  };

  user.emailToken = token;
  user.markModified('emailToken');
  user.save();

  mg.messages.create(domain, data);
};

export const isThrowawayEmail = (email: string): boolean => {
  return disposableEmails.indexOf(email.split('@')[1]) !== -1;
};
