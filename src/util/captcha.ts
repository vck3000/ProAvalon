import { RequestHandler } from 'express';
import axios from 'axios';
import { config } from '../config';

export const captchaMiddleware: RequestHandler = async (req, res, next) => {
  if (config.getEnv() !== 'prod') {
    return next();
  }

  req.body.captcha = req.body['g-recaptcha-response'];
  if (
    req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null
  ) {
    // @ts-ignore
    req.flash('error', 'The captcha failed or was not inputted.');
    res.redirect('register');
    return;
  }

  const secretKey = config.getGoogleCaptchaKey();
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
  const response = await axios.post(verifyUrl);

  if (response.data.success === undefined || !response.data.success) {
    // @ts-ignore
    req.flash('error', 'Failed captcha verification.');
    res.redirect('register');
    return;
  }

  next();
};
