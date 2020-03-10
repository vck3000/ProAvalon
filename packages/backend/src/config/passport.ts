import passport from 'passport';
import passportLocal from 'passport-local';

import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from '../models/User';

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: UserDocument, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne(
      { usernameLower: username.toLowerCase() },
      (findOneErr: Error, user: UserDocument) => {
        if (findOneErr) {
          return done(findOneErr);
        }
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        return user.comparePassword(
          password,
          (err: Error, isMatch: boolean) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: 'Invalid password' });
          },
        );
      },
    );
  }),
);

/**
 * Login Required middleware.
 */
// eslint-disable-next-line import/prefer-default-export
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
};
