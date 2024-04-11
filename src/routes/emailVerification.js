import { Router } from 'express';
import User from '../models/user';
import {
  isThrowawayEmail,
  sendEmailVerification,
} from '../myFunctions/sendEmailVerification';
import validator from 'validator';

const router = new Router();

function checkEmailVerifiedAlready(req, res, next) {
  if (req.user.emailVerified === true) {
    req.flash('error', 'You have already verified your email.');
    res.redirect('/');
  } else {
    next();
  }
}

router.get('/', checkEmailVerifiedAlready, (req, res) => {
  res.render('verifyEmail', { currentUser: req.user });
});

router.get(
  '/resendEmailVerification',
  checkEmailVerifiedAlready,
  (req, res) => {
    sendEmailVerification(req.user, req.user.emailAddress);
    res.render('simpleText', { contents: 'Verification email resent!' });
  },
);

router.post('/addNewEmail', checkEmailVerifiedAlready, async (req, res) => {
  if ((await emailExists(req.body.emailAddress)) === true) {
    req.flash('error', 'This email address is already in use.');
    res.redirect('/emailVerification');
  } else if (validEmail(req.body.emailAddress) === false) {
    req.flash('error', 'Please provide a valid email address.');
    res.redirect('/emailVerification');
  } else {
    // All is good.
    sendEmailVerification(req.user, req.body.emailAddress);
    req.flash('success', 'Email added. Thank you.');
    res.redirect('/emailVerification');
  }
});

function validEmail(email) {
  return (
    emailContainsBadCharacter(email) === false ||
    validator.isEmail(email) === true ||
    isThrowawayEmail(email) === false
  );
}

async function emailExists(email) {
  var userEmailDuplicate = await User.findOne({ emailAddress: email })
    .populate('notifications')
    .exec();
  if (userEmailDuplicate) {
    return true;
  } else {
    return false;
  }
}

function emailContainsBadCharacter(str) {
  // only allow alphanumerical and @ and . symbols.
  const regx = /^[A-Za-z0-9\@\._-]+$/;

  if (
    !regx.test(str) ||
    str.includes('&lt;') ||
    str.includes('&gt;') ||
    str.includes('&apos;') ||
    str.includes('&quot;') ||
    str.includes('[') ||
    str.includes(']') ||
    str.includes('/') ||
    str.includes('\\') ||
    str.includes('&') ||
    str.includes(';')
  ) {
    return true;
  }

  return false;
}

export const emailVerificationRoutes = router;
export { validEmail, emailExists };
