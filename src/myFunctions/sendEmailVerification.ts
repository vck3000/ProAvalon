import ejs from 'ejs';
import emailTemplateEmailVerification from './emailTemplateEmailVerification';
import uuid from 'uuid';
import disposableEmails from '../util/disposableEmails.js';
import { sendEmail } from './sendEmail';
import { config } from '../config/config';

const serverDomain = config.getServerDomain();

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

  user.emailToken = token;
  user.markModified('emailToken');
  user.save();

  const message = ejs.render(emailTemplateEmailVerification, {
    serverDomain,
    token,
  });
  const subject = 'Welcome! Please verify your email address.';

  sendEmail(email, subject, message);
};

export const isThrowawayEmail = (email: string): boolean => {
  return disposableEmails.indexOf(email.split('@')[1]) !== -1;
};
