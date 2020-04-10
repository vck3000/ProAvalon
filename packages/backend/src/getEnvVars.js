// Checks for production. Each variable must be defined.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw Error('Environment variable DATABASE_URL was not provided');
  }
  if (!process.env.JWT_SECRET_KEY) {
    throw Error('Environment variable JWT_SECRET_KEY was not provided');
  }
}

export const MONGO_URL =
  process.env.DATABASE_URL ||
  'mongodb://root:password@localhost:27017/proavalon?authSource=admin';

export const JWT_SECRET = process.env.JWT_SECRET_KEY || 'my_secret';
