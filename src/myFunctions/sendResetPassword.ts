import uuid from 'uuid';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import ejs from 'ejs';
import emailTemplateResetPassword from './emailTemplateResetPassword';

// const api_key = process.env.MAILGUN_API_KEY;
// const domain = process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
// const server_domain = process.env.SERVER_DOMAIN;
//
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({ username: 'api', key: api_key });

const uuidv4 = uuid.v4;

export const sendResetPassword = (user: any, email: string) => {
  const token = uuidv4();
  const dateExpired = new Date();

  // const message = ejs.render(emailTemplateResetPassword, { server_domain, token });

  // const data = {
  //   from: 'ProAvalon <' + process.env.PROAVALON_EMAIL_ADDRESS + '>',
  //   to: user.emailAddress,
  //   subject: 'ProAvalon Reset Password Request.',
  //   html: message,
  // };

  // Set dateExpired to be 1 hour later
  dateExpired.setHours(dateExpired.getHours() + 1);

  user.emailToken = token;
  user.tokenExpiry = dateExpired;
  user.markModified('emailToken');
  user.save();
};
