import uuid from 'uuid';
import ejs from 'ejs';

import { config } from '../config';
import emailTemplateResetPassword from './emailTemplateResetPassword';
import { sendEmail } from './sendEmail';
import { passwordResetRequestsMetric } from '../metrics/miscellaneousMetrics';

const TOKEN_TIMEOUT = 60 * 60 * 1000; // 1 hour
const serverDomain = config.SERVER_DOMAIN;

export const sendResetPassword = async (user: any, email: string) => {
  const token = uuid.v4();
  const currentDate = new Date();

  // Set tokenDateExpired to be 1 hour later
  let tokenDateExpired = new Date(currentDate.getTime() + TOKEN_TIMEOUT);

  user.emailToken = token;
  user.emailTokenExpiry = tokenDateExpired;
  user.markModified('emailToken');
  user.markModified('emailTokenExpiry');
  user.save();

  const message = ejs.render(emailTemplateResetPassword, {
    serverDomain,
    token,
  });
  const subject = 'ProAvalon Reset Password Request.';

  sendEmail(email, subject, message);

  passwordResetRequestsMetric.inc(1);
};
