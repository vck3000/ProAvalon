import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { User, UserDocument } from '../models/User';

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check('password', 'Password cannot be blank')
    .isLength({ min: 4 })
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.redirect('/');
  }

  return passport.authenticate('local', (authErr: Error, user: UserDocument) => {
    if (authErr) {
      return next(authErr);
    }
    if (!user) {
      return res.send({ msg: 'Invalid password.' });
    }
    return req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // eslint-disable-next-line no-console
      console.log('==> login user', user);
      return res.redirect('/lobby');
    });
  })(req, res, next);
};

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
  // eslint-disable-next-line consistent-return
): Promise<UserDocument | null | void> => {
  await check('emailAddress', 'Email is not valid')
    .isEmail()
    .run(req);
  await check('password', 'Password must be at least 4 characters long')
    .isLength({ min: 4 })
    .run(req);
  await check('confirmPassword', 'Passwords do not match')
    .equals(req.body.password)
    .run(req);
  await check('emailAddress')
    .normalizeEmail()
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(errors.array());
    return res.redirect('/');
  }

  const user = new User({
    username: req.body.username,
    usernameLower: req.body.username.toLowerCase(),
    emailAddress: req.body.emailAddress,
    password: req.body.password,
    emailVerified: true,
  });

  await User.findOne(
    { emailAddress: req.body.emailAddress },
    (err, existingUser) => {
      if (err) return next(err);
      if (existingUser) {
        return res.send({
          msg: 'Account with that email address already exists.',
        });
      }
      return null;
    },
  );

  await User.findOne(
    { usernameLower: req.body.username.toLowerCase() },
    (err, existingUser) => {
      if (err) return next(err);
      if (existingUser) {
        return res.send({ msg: 'Account with that username already exists.' });
      }
      return null;
    },
  );

  await user.save((saveErr) => {
    if (saveErr) return next(saveErr);
    return req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // eslint-disable-next-line no-console
      console.log('==> saving user', user);
      return res.redirect('/lobby');
    });
  });
};

export const logout = (req: Request, res: Response): void => {
  req.logout();
  return res.redirect('/');
};
