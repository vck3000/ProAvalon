import uuid from 'uuid';
import ejs from 'ejs';
import emailTemplateResetPassword from './emailTemplateResetPassword';
import { sendEmail } from './sendEmail';

const TOKEN_TIMEOUT = 60 * 60 * 1000; // 1 hour

const server_domain = process.env.SERVER_DOMAIN;

const uuidv4 = uuid.v4;

export const sendResetPassword = async (user: any, email: string) => {
  const token = uuidv4();
  const currentDate = new Date();
  let tokenDateExpired = new Date();

  // Set tokenDateExpired to be 1 hour later
  tokenDateExpired.setTime(currentDate.getTime() + TOKEN_TIMEOUT);

  user.emailToken = token;
  user.emailTokenExpiry = tokenDateExpired;
  user.markModified('emailToken');
  user.markModified('emailTokenExpiry');
  user.save();

  const message = ejs.render(emailTemplateResetPassword, {
    server_domain,
    token,
  });
  const subject = 'ProAvalon Reset Password Request.';

  sendEmail(email, subject, message);
};
