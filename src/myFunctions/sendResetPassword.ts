import uuid from 'uuid';
import { Schema } from 'mongoose';

const uuidv4 = uuid.v4;

export const sendResetPassword = (user: any, email: string) => {
  const token = uuidv4();
  const dateExpired = new Date();

  // Set dateExpired to be 1 hour later
  dateExpired.setHours(dateExpired.getHours() + 1);

  user.emailToken = token;
  user.tokenExpiry = dateExpired;
  user.markModified('emailToken');
  user.save();
};
