// Checks for production. Each variable must be defined.
if (process.env.ENV === 'production') {
  if (!process.env.BACKEND_URL) {
    throw Error('Environment variable BACKEND_URL was not provided');
  }
}

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
