// @ts-nocheck
import './env.js';
import './config';
import 'log-timestamp';
import { sendToDiscordAdmins } from './clients/discord';
import assert from 'assert';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import flash from 'connect-flash';
import compression from 'compression';
import methodOverride from 'method-override';
import LocalStrategy from 'passport-local';
import mongoose from 'mongoose';
import passport from 'passport';
import passportSocketIo from 'passport.socketio';
import path from 'path';
import session from 'express-session';
import socket, { Server as SocketServer } from 'socket.io';
import createProxyMiddleware from 'http-proxy-middleware';
import morgan from 'morgan';

import { server as socketServer } from './sockets/sockets';
import User from './models/user';
import { emailVerified, isLoggedIn } from './routes/middleware';
import indexRoutes from './routes/index';
import communityRoutes from './routes/community';
import { emailVerificationRoutes } from './routes/emailVerification';
import lobbyRoutes from './routes/lobby';
import forumRoutes from './routes/forum';
import profileRoutes from './routes/profile';
import patreonRoutes from './routes/patreon';
import modRoutes from './routes/mod';
import staticifyFactory from 'staticify';
// Create a MongoDB session store
import MongoDBStoreFactory from 'connect-mongodb-session';
import { SESSIONS_COLLECTION_NAME } from './constants';
import { counters, promAgent } from './clients/victoriaMetrics/promAgent';
import { PromMetricGaugeFactory } from './clients/victoriaMetrics/promMetricGaugeFactory'; // TODO-kev: Remember to delete

const assetsPath = path.join(__dirname, '../assets');

// Die if env var isn't given in
if (
  process.env.ENV !== 'local' &&
  process.env.ENV !== 'staging' &&
  process.env.ENV !== 'prod'
) {
  console.error('Bad environment variable given.');
  process.exit(1);
}

const app = express();
app.use(compression());
app.use(express.static(assetsPath, { maxAge: 518400000 })); // expires in 7 days.

const staticify = staticifyFactory(assetsPath);

app.use(staticify.middleware);
app.locals.getVersionedPath = staticify.getVersionedPath;

// Trust upstream IP X-Forwarded-For header from proxy
app.set('trust proxy', true);

morgan.token('body', (req, res) => {
  if (req.url === '/login') {
    return JSON.stringify({ username: req.body.username });
  } else if (req.url === '/' && req.method === 'POST') {
    return JSON.stringify({
      username: req.body.username,
      emailAddress: req.body.emailAddress,
    });
  } else if (
    new RegExp('.*/changepassword').test(req.url) &&
    req.method === 'POST'
  ) {
    return '';
  }

  return JSON.stringify(req.body);
});

app.use(
  morgan(
    '[:date[iso]] [Morgan] :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :body - :response-time ms',
  ),
);

if (process.env.ENV === 'local') {
  console.log('Routing dist_webpack to localhost:3010.');
  app.use(
    '/dist_webpack',
    createProxyMiddleware({ target: 'http://localhost:3010' }),
  );
}

const port = process.env.PORT || 3000;
const dbLoc = process.env.DATABASEURL;
console.log(`Using database url: ${dbLoc}`);

mongoose.connect(dbLoc, {
  retryWrites: false,
});

const MongoDBStore = MongoDBStoreFactory(session);

const store = new MongoDBStore({
  uri: dbLoc,
  collection: SESSIONS_COLLECTION_NAME,
});

// Catch errors
store.on('error', (err) => {
  console.log(err);
  console.log(
    '--------------\nIs your mongoDB server running?\n--------------',
  );
  assert.ifError(err);
  assert.ok(false);
});

process
  .on('unhandledRejection', (reason, p) => {
    const msg = `Unhandled Rejection at: Promise ${p}
      'reason:'
      ${reason}

      'reason.details:'
      ${reason.details}

      'reason.stack:'
      ${reason.stack}`;

    console.error(msg);
    sendToDiscordAdmins(msg);
  })
  .on('uncaughtException', (err) => {
    const msg = `Uncaught exception: ${err.stack}`;
    console.error(msg);
    sendToDiscordAdmins(msg);
  });

// authentication
const secretKey = process.env.MY_SECRET_KEY || 'MySecretKey';
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store,
  }),
);

app.use(flash());
app.use(cookieParser());

// res.locals variables
app.use((req, res, next) => {
  // headerActive default should be nothing, otherwise specify in routes/index.js
  res.locals.headerActive = ' ';
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(indexRoutes);
app.use(communityRoutes);

// Lobby, forum, and profile routes require a logged in user
app.use(isLoggedIn);

app.use('/emailVerification', emailVerificationRoutes);

app.use(emailVerified);

app.use('/mod', modRoutes);
app.use('/patreon', patreonRoutes);

app.use('/lobby', lobbyRoutes);
app.use('/forum', forumRoutes);
app.use('/profile', profileRoutes);

const IP = process.env.IP || '127.0.0.1';
const server = app.listen(port, () => {
  console.log(`Server has started on ${IP}:${port}!`);
});

const io: SocketServer = socket(server, {
  pingTimeout: 30000,
  pingInterval: 10000,
});

io.use(
  passportSocketIo.authorize({
    cookieParser,
    secret: secretKey,
    store,
    passport,
  }),
);

socketServer(io);

// TODO-kev: Test - remove all lines below this once extracted out

(async () => {
  // await promAgent.incrementCounter('test_counter', 2);
  // await promAgent.test();
})();

// setInterval(async () => {
//   // const metric = await promAgent.getMetric(counters.PATREON_LINK_ATTEMPTS);
//   // promAgent.incrementCounter(counters.PATREON_LINK_ATTEMPTS, 2);
//   // console.log(metric);
//   // let randomInt = Math.floor(Math.random() * 10);
//   // console.log(counter);
//   // promAgent.incrementCounter(counters.TEST, counter);
//   //
//   // await promAgent.pushMetricsToVictoriaMetrics();
//   // counter++;
// }, 2000); // Push every 5sec

// Periodically push metrics to VictoriaMetrics
// setInterval(async () => {
//   console.log('HIT');
//
//   let randomInt = Math.floor(Math.random() * 10);
//   testCounter.inc(randomInt);
//
//   await pushMetricsToVictoriaMetrics();
//   await promClient.register.resetMetrics();
// }, 5000); // Push every 5sec
