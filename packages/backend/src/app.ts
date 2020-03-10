import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import mongoose from 'mongoose';
import passport from 'passport';

import func from './asdf';

// Controllers (route handlers)
import * as userController from './controllers/user';

// API keys and Passport configuration
import * as passportConfig from './config/passport';

const mongoUrl = process.env.DATABASEURL
  || 'mongodb://root:password@mongo/proavalon?authSource=admin';
const secretKey = process.env.MY_SECRET_KEY || 'MySecretKey';

const app = express();
const port = process.env.PORT || 3001;

const RedisStore = connect(session);
const redisClient = redis.createClient(6379, 'redis');

app.set('port', port);
app.use(express.json());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: secretKey,
    store: new RedisStore({ client: redisClient }),
  }),
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (_req, res) => {
  // eslint-disable-next-line no-console
  console.log('Hello123123');
  func();
  res.send('Hello World!12345 asdf');
});

app.get('/lobby', passportConfig.isAuthenticated, (_req, res) => {
  res.send('signed in to lobby');
});

app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);
app.get('/logout', userController.logout);

app.listen(port);

/* , () => console.log(`Example app listening on port ${port}!`) */
