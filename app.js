/* eslint-disable import/order */
//= ====================================
// INITIALISATION
//= ====================================
require('dotenv').config();
const express = require('express');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
var passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const modAction = require('./models/modAction');

app.use(express.static('assets', { maxAge: 1800000 })); // expires in 30 minutes.

const staticify = require('staticify')('assets');

app.use(staticify.middleware);

app.locals = {
    getVersionedPath: staticify.getVersionedPath,
};

const port = process.env.PORT || 80;
const dbLoc = process.env.DATABASEURL || 'mongodb://localhost/TheNewResistanceUsers';
console.log(`Using database url: ${dbLoc}`);

mongoose.connect(dbLoc);

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    // uri: 'mongodb://localhost/TheNewResistanceUsers',
    // uri: 'mongodb://127.0.0.1/TheNewResistanceUsers',
    uri: dbLoc,
    collection: 'mySessions',
});


// Catch errors
store.on('error', (error) => {
    console.log('--------------\nIs your mongoDB server running?\n--------------');
    assert.ifError(error);
    assert.ok(false);
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
    res.locals.currentUser = req.user;
    // headerActive default should be nothing, otherwise specify in the routes index.js file
    res.locals.headerActive = ' ';
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// HTTPS REDIRECT
const platform = process.env.MY_PLATFORM || 'local';
if (platform === 'online' || platform === 'staging') {
    app.use((request, response, next) => {
        if (request.headers['x-forwarded-proto'] !== 'https') {
            response.redirect(`https://${request.hostname}${request.url}`);
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

const requireLoggedInRoutes = [
    '/lobby',
    '/forum',
    '/profile',
];

async function checkLoggedIn(req, res, next) {
    let banned;
    for (let i = 0; i < requireLoggedInRoutes.length; i++) {
        if (req.originalUrl.startsWith(requireLoggedInRoutes[i]) == true) {
            // Check for logged in.
            if (req.isAuthenticated() == false) {
                req.flash('error', 'Please log in to view this page.');
                res.redirect('/');
                return;
            }

            // Check bans
            await modAction.findOne({ 'bannedPlayer.usernameLower': req.user.username.toLowerCase() }, (err, m) => {
                if (err) {
                    console.log(err);
                } else {
                    // console.log("A");
                    // console.log(m);
                    if (m == null || m == undefined) {
                        // all good
                    } else {
                        let message = `You have been banned. The ban will be released on ${m.whenRelease}. Ban description: '${m.descriptionByMod}'`;
                        message += ' Reflect on your actions.';
                        req.flash('error', message);
                        res.redirect('/');
                        banned = true;
                    }
                }
            });
            // console.log("Logged in!");
        }
    }

    if (banned == true) {
        // console.log("banned");
        return;
    }
    next();
}
app.use(checkLoggedIn);


const indexRoutes = require('./routes/index');

app.use(indexRoutes);

const forumRoutes = require('./routes/forum');

app.use('/forum', forumRoutes);

const profileRoutes = require('./routes/profile');

app.use('/profile', profileRoutes);

const patreonRoutes = require('./routes/patreon');

app.use('/patreon', patreonRoutes);

// start server listening
const IP = process.env.IP || '127.0.0.1';
// var server = app.listen(port, IP , function(){
const server = app.listen(port, () => {
    console.log(`Server has started on ${IP}:${port}!`);
});


//= ====================================
// SOCKETS
//= ====================================
const socket = require('socket.io');

const io = socket(server);
var passportSocketIo = require('passport.socketio');

require('./sockets/sockets')(io);

io.use(passportSocketIo.authorize({
    cookieParser, // optional your cookie-parser middleware function. Defaults to require('cookie-parser')
    // key:          'express.sid',       //make sure is the same as in your session settings in app.js
    secret: secretKey, // make sure is the same as in your session settings in app.js
    store, // you need to use the same sessionStore you defined in the app.use(session({... in app.js
    // success:      onAuthorizeSuccess,  // *optional* callback on success
    // fail:         onAuthorizeFail,     // *optional* callback on fail/error
    passport,
}));


// setTimeout(function(){

// 	console.log("Starting gameRecord database fix...");

// 	var gameRecord = require("./models/gameRecord");

// 	gameRecord.find({}).exec(function (err, records) {
// 		// gameRecord.find({}).skip(17000).limit(100).exec(function (err, records) {
// 		if (err) {
// 			console.log(err);
// 		}
// 		else {
// 			console.log(records.length + " games loaded.");

// 			var missingGameMode = 0;
// 			var missingLadyCard = 0;
// 			// var count = 0;
// 			records.forEach(async function(r){
// 				// console.log(r);


// 				if(r.gameMode == undefined){
// 					missingGameMode += 1;
// 					console.log("missing gameMode: " + missingGameMode);
// 					if(missingGameMode % 1000 == 0){
// 						console.log(r);
// 					}

// 					r.gameMode = "avalon";
// 					r.markModified("gameMode");
// 					await r.save();
// 				}

// 				if(r.sireChain.length > 0 && r.cards.includes("sire of the sea") == false){
// 					console.log("Sire");
// 					console.log(r.sireChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);


// 					r.cards.push("sire of the sea");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				if(r.ladyChain.length > 0 && r.cards.includes("lady of the lake") == false){
// 					console.log("Lady");
// 					console.log(r.ladyChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);

// 					r.cards.push("lady of the lake");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				if(r.refChain.length > 0 && r.cards.includes("ref of the rain") == false){
// 					console.log("Ref");
// 					console.log(r.refChain + "\t" + r.cards);
// 					console.log(r.timeGameFinished);

// 					r.cards.push("ref of the rain");
// 					r.markModified("cards");
// 					await r.save();
// 				}

// 				// count += 1;
// 				// if(count % 2000 == 0){
// 				// 	console.log(r);
// 				// }
// 			});


// 			console.log("Done!");
// 		}
// 	});
// }, 5000);
