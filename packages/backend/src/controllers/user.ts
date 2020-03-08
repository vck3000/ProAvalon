/* eslint-disable no-shadow */
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';
import { check, sanitize, validationResult } from 'express-validator';
import { User, UserDocument } from '../models/User';

export const getLogin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user) {
    return next();
  }
  return res.redirect('/');
};

export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await check('emailAddress', 'Email is not valid').isEmail().run(req);
  await check('password', 'Password cannot be blank').isLength({ min: 4 }).run(req);
  // eslint-disable-next-line @typescript-eslint/camelcase
  await sanitize('emailAddress').normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/login');
  }

  return passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    return req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      return res.redirect('/');
    });
  })(req, res, next);
};

export const getSignup = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user) {
    return next();
  }
  return res.redirect('/');
};

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check('emailAddress', 'Email is not valid').isEmail().run(req);
  await check('password', 'Password must be at least 4 characters long').isLength({ min: 4 }).run(req);
  await check('confirmPassword', 'Passwords do not match').equals(req.body.password).run(req);
  // eslint-disable-next-line @typescript-eslint/camelcase
  await sanitize('emailAddress').normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/signup');
  }

  const user = new User({
    username: req.body.username,
    usernameLower: req.body.usernameLower,
    emailAddress: req.body.emailAddress,
    password: req.body.password,
  });

  User.findOne({ emailAddress: req.body.emailAddress }, (err, existingUser) => {
    if (err) return next(err);
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    return user.save((err) => {
      if (err) return next(err);
      return req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    });
  });

  return next();
};
