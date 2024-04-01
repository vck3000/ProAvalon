import uuid from 'uuid';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import ejs from 'ejs';
import emailTemplateResetPassword from './emailTemplateResetPassword';

const TOKEN_TIMEOUT = 60 * 60 * 1000; // 1 hour

// const api_key = process.env.MAILGUN_API_KEY;
// const domain = process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
// const server_domain = process.env.SERVER_DOMAIN;
//
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({ username: 'api', key: api_key });

const uuidv4 = uuid.v4;

export const sendResetPassword = async (user: any, email: string) => {
  const token = uuidv4();
  const currentDate = new Date();
  let tokenDateExpired = new Date();

  // Set tokenDateExpired to be 1 hour later
  tokenDateExpired.setTime(currentDate.getTime() + TOKEN_TIMEOUT);

  // const message = ejs.render(emailTemplateResetPassword, { server_domain, token });

  // const data = {
  //   from: 'ProAvalon <' + process.env.PROAVALON_EMAIL_ADDRESS + '>',
  //   to: user.emailAddress,
  //   subject: 'ProAvalon Reset Password Request.',
  //   html: message,
  // };

  user.emailToken = token;
  user.emailTokenExpiry = tokenDateExpired;
  user.markModified('emailToken');
  user.markModified('emailTokenExpiry');
  user.save();
};
