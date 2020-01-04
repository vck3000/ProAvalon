/* eslint-disable import/order */
require('dotenv').config();

const assert = require('assert');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
const path = require('path');
const session = require('express-session');
const socket = require('socket.io');

const User = require('./models/user');

const { isLoggedIn, emailVerified } = require('./routes/middleware');
const indexRoutes = require('./routes/index');
const { emailVerificationRoutes } = require('./routes/emailVerification');
const lobbyRoutes = require('./routes/lobby');
const forumRoutes = require('./routes/forum');
const profileRoutes = require('./routes/profile');
const patreonRoutes = require('./routes/patreon');
const modRoutes = require('./routes/mod');

const assetsPath = path.join(__dirname, 'assets');

const app = express();
app.use(express.static(assetsPath, { maxAge: 518400000 })); // expires in 7 days.

const staticify = require('staticify')(assetsPath);

app.use(staticify.middleware);
app.locals.getVersionedPath = staticify.getVersionedPath;

const port = process.env.PORT || 80;
const dbLoc = process.env.DATABASEURL || 'mongodb://localhost/TheNewResistanceUsers';
console.log(`Using database url: ${dbLoc}`);

mongoose.connect(dbLoc, {
    retryWrites: false
});

// Create a MongoDB session store
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: dbLoc,
    collection: 'mySessions',
});

// Catch errors
store.on('error', (err) => {
    console.log(err);
    console.log('--------------\nIs your mongoDB server running?\n--------------');
    assert.ifError(err);
    assert.ok(false);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, 'reason.stack:', reason.stack);
    // application specific logging, throwing an error, or other logic here
});


// authentication
const secretKey = process.env.MY_SECRET_KEY || 'MySecretKey';
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store,
}));

app.use(flash());

// res.locals variables
app.use((req, res, next) => {
    // headerActive default should be nothing, otherwise specify in routes/index.js
    res.locals.headerActive = ' ';
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// HTTPS REDIRECT
const platform = process.env.MY_PLATFORM || 'local';
if (platform === 'online' || platform === 'staging') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            res.redirect(`https://${req.hostname}${req.url}`);
        } else {
            next();
        }
    });
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Insert ban checks here.
// TODO 

app.use(indexRoutes);

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

//= ====================================
// SOCKETS
//= ====================================
const io = socket(server);

require('./sockets/sockets')(io);

io.use(passportSocketIo.authorize({
    cookieParser,
    secret: secretKey, // same as in your session settings
    store, // same as sessionStore in app.use(session({...
    passport,
}));
