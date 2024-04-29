import { Router } from 'express';
import passport from 'passport';
import sanitizeHtml from 'sanitize-html';
import mongoose from 'mongoose';
import fs from 'fs';
import request from 'request';
import rateLimit from 'express-rate-limit';
import User from '../models/user';
import myNotification from '../models/notification';
import gameRecord from '../models/gameRecord';
import statsCumulative from '../models/statsCumulative';
import { emailExists, validEmail } from '../routes/emailVerification';
import { sendEmailVerification } from '../myFunctions/sendEmailVerification';

import { disallowVPNs } from '../util/vpnDetection';
import Settings from '../settings';
import { Alliance } from '../gameplay/types';
import { resRoles, rolesToAlliances, spyRoles } from '../gameplay/roles/roles';
import { sendResetPassword } from '../myFunctions/sendResetPassword';
import uuid from 'uuid';

const router = new Router();

// Index route
router.get('/', (req, res) => {
  res.render('index');
});

// register route
router.get('/register', (req, res) => {
  res.render('register', { platform: process.env.ENV });
});

const registerLimiter =
  process.env.ENV === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
      })
    : rateLimit({
        windowMs: 60 * 60 * 1000, // 60 minutes
        max: 10,
      });

// Post of the register route - Create an account
router.post(
  '/',
  registerLimiter,
  disableRegistrationMiddleware,
  sanitiseUsername,
  sanitiseEmail,
  disallowVPNs,
  async (req, res) => {
    // if we are local, we can skip the captcha
    if (process.env.ENV === 'prod') {
      req.body.captcha = req.body['g-recaptcha-response'];
      if (
        req.body.captcha === undefined ||
        req.body.captcha === '' ||
        req.body.captcha === null
      ) {
        req.flash('error', 'The captcha failed or was not inputted.');
        res.redirect('register');
        return;
      }

      const secretKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;

      const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
      const body = await request(verifyUrl);

      if (body.success !== undefined && !body.success) {
        req.flash('error', 'Failed captcha verification.');
        res.redirect('register');
        return;
      }
    }

    // duplicate code as below
    const newUser = new User({
      username: req.body.username,
      usernameLower: req.body.username.toLowerCase(),
      dateJoined: new Date(),
      emailAddress: req.body.emailAddress.toLowerCase(),
    });

    if (req.body.username.indexOf(' ') !== -1) {
      req.flash(
        'error',
        'Sign up failed. Please do not use spaces in your username.',
      );
      res.redirect('register');
    } else if (req.body.username.length > 25) {
      req.flash(
        'error',
        'Sign up failed. Please do not use more than 25 characters in your username.',
      );
      res.redirect('register');
    } else if (usernameContainsBadCharacter(req.body.username) === true) {
      req.flash('error', 'Please do not use an illegal character.');
      res.redirect('register');
    } else if (validEmail(req.body.emailAddress) === false) {
      req.flash('error', 'Please provide a valid email address.');
      res.redirect('register');
    } else if (await emailExists(req.body.emailAddress)) {
      console.log(req.body.emailAddress);
      console.log('In email exists... is true');
      req.flash('error', 'This email address is already in use.');
      res.redirect('register');
    } else {
      User.register(newUser, req.body.password, (err, user) => {
        if (err) {
          console.log(`ERROR: ${err}`);
          req.flash(
            'error',
            'Sign up failed. Most likely that username is taken.',
          );
          res.redirect('register');
        } else {
          passport.authenticate('local')(req, res, () => {
            res.redirect('/lobby');
          });
          if (process.env.ENV === 'prod') {
            sendEmailVerification(user, req.body.emailAddress);
          } else {
            user.emailVerified = true;
            user.markModified('emailVerified');
            user.save();
          }
        }
      });
    }
  },
);

const loginLimiter =
  process.env.ENV === 'local'
    ? rateLimit({
        max: 0, // Disable if we are local
      })
    : rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 10,
      });

// login route
router.post(
  '/login',
  loginLimiter,
  sanitiseUsername,
  setCookieDisplayUsername,
  // Ignore disallowing VPNs for login routes due to overuse of the service.
  // disallowVPNs,
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFail',
  }),
);

router.get('/loginSuccess', async (req, res) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }

  if (req.user.lastLoggedIn === undefined) {
    req.user.lastLoggedIn = [new Date()];
  }
  req.user.lastLoggedIn.push(new Date());

  // Only keep track of the last logged in and the current login time.
  while (req.user.lastLoggedIn.length > 2) {
    req.user.lastLoggedIn.shift();
  }

  req.user.markModified('lastLoggedIn');

  if (req.user.username !== req.cookies['displayUsername']) {
    if (req.cookies['displayUsername'].toLowerCase() !== req.user.usernameLower)
    {
      req.flash('error', 'Log in failed! Please try again.');
      res.redirect('/');

      throw new Error("Client requested new display name does not match their lowercase username.");
    }

    req.user.username = req.cookies['displayUsername'];
    req.user.markModified('username');
  }

  await req.user.save();

  res.redirect('/lobby');
});

router.get('/loginFail', (req, res) => {
  req.flash('error', 'Log in failed! Please try again.');
  res.redirect('/');
});

// Special route that needs to exist here as the user may not be logged in yet.
router.get('/emailVerification/verifyEmailRequest', async (req, res) => {
  const user = await User.findOne({ emailToken: req.query.token })
    .populate('notifications')
    .exec();
  if (user) {
    user.emailVerified = true;
    user.emailToken = undefined;
    user.markModified('emailVerified');
    user.markModified('emailToken');
    await user.save();

    req.flash('success', 'Email verified! Thank you!');
    res.redirect('/');
  } else {
    req.flash(
      'error',
      "The link provided for email verification is invalid or expired. Please log in and press the 'Resend verification email' button.",
    );
    res.redirect('/');
  }
});

// logout
router.get('/logout', (req, res) => {
  // doesn't work since we destroy the session right after...
  // req.flash("success", "Logged you out!");
  req.session.destroy((err) => {
    res.redirect('/'); // Inside a callback… bulletproof!
  });
});

router.get('/changelog', (req, res) => {
  res.render('changelog', {
    currentUser: req.user,
    headerActive: 'changelog',
    path: 'changelog',
  });
});

router.get('/rules', (req, res) => {
  res.render('rules', { currentUser: req.user, headerActive: 'rules' });
});

router.get('/about', (req, res) => {
  res.render('about', { currentUser: req.user, headerActive: 'about' });
});

router.get('/security', (req, res) => {
  res.render('security', { currentUser: req.user });
});

router.get('/statistics', (req, res) => {
  res.render('statistics', { currentUser: req.user, headerActive: 'stats' });
});

router.get('/resetPassword', (req, res) => {
  res.render('resetPassword', { platform: process.env.ENV });
});

router.post('/resetPassword', registerLimiter, async (req, res) => {
  // if we are local, we can skip the captcha
  if (process.env.ENV === 'prod') {
    req.body.captcha = req.body['g-recaptcha-response'];
    if (
      req.body.captcha === undefined ||
      req.body.captcha === '' ||
      req.body.captcha === null
    ) {
      req.flash('error', 'The captcha failed or was not inputted.');
      res.redirect('/resetPassword');
      return;
    }

    const secretKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;

    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
    const body = await request(verifyUrl);

    if (body.success !== undefined && !body.success) {
      req.flash('error', 'Failed captcha verification.');
      res.redirect('/resetPassword');
      return;
    }
  }

  const secretKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;

  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
  const body = await request(verifyUrl);

  if (body.success !== undefined && !body.success) {
    req.flash('error', 'Failed captcha verification.');
    res.redirect('/');
    return;
  }

  const email = req.body.emailAddress;
  const user = await User.findOne({
    emailAddress: email,
    emailVerified: true,
  });

  if (!user) {
    req.flash(
      'error',
      'Email does not exist. Please enter a registered email address.',
    );
    res.redirect('/resetPassword');
    console.log(`Email not found: ${email}`);
  } else {
    sendResetPassword(user, email);
    req.flash(
      'success',
      'A link to reset your password has been sent to your email.',
    );
    res.redirect('/');
    console.log(
      `User: ${user.username} Email: ${user.emailAddress} has requested to reset their password.`,
    );
  }
});

router.get('/resetPassword/verifyResetPassword', async (req, res) => {
  if (req.query.token && req.query.token.trim() !== '') {
    const user = await User.findOne({ emailToken: req.query.token });

    if (
      user &&
      user.emailTokenExpiry &&
      new Date().getTime() < user.emailTokenExpiry.getTime()
    ) {
      user.emailToken = undefined;
      user.markModified('emailToken');

      // Set new temporary password
      const newPassword = uuid.v4().substring(0, 12);

      await new Promise((resolve, reject) => {
        user.setPassword(newPassword, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });

      await user.save();

      req.flash('success', 'Your password has been reset!');
      res.render('resetPasswordSuccess', { newPassword });
      return;
    }
  }

  req.flash(
    'error',
    'The link provided to reset your password is invalid or expired.',
  );
  res.redirect('/');
});

function gameDateCompare(a, b) {
  if (a.date < b.date) {
    return -1;
  }
  if (a.date > b.date) {
    return 1;
  }

  return 0;
}

router.get('/ajax/getStatistics', (req, res) => {
  statsCumulative.findOne({}).exec((err, record) => {
    if (err) {
      console.log(err);
      res.status(200).send('Something went wrong');
    } else {
      if (record === undefined || record === null) {
        res.status(200).send('Something went wrong');
      } else {
        res.status(200).send(JSON.parse(record.data));
      }
    }
  });
});

const anonymizeArray = function (array, idmap) {
  if (!array) {
    return array;
  }
  const anonArray = [];
  for (let i = 0; i < array.length; i++) {
    anonArray.push(idmap[array[i]]);
  }
  return anonArray;
};

const anonymizeMapKeys = function (map, idmap) {
  if (!map) {
    return map;
  }
  const anonMap = JSON.parse(JSON.stringify(map));
  for (const key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }
    if (key !== idmap[key]) {
      Object.defineProperty(
        anonMap,
        idmap[key],
        Object.getOwnPropertyDescriptor(anonMap, key),
      );
      delete anonMap[key];
    }
  }
  return anonMap;
};

const anonymizeStats = function (records) {
  const anonymizedRecords = [];
  for (var key in records) {
    const record = records[key];
    const anonymizedRecord = JSON.parse(JSON.stringify(record));
    const usernamesMap = {};
    const usernamesPossible = 'abcdefghijklmnopqrstuvwxyz';
    let idx = 0;
    for (var key in record.playerRoles) {
      if (record.playerRoles.hasOwnProperty(key)) {
        usernamesMap[key] = usernamesPossible[idx++];
      }
    }
    anonymizedRecord.spyTeam = anonymizeArray(record.spyTeam, usernamesMap);
    anonymizedRecord.resistanceTeam = anonymizeArray(
      record.resistanceTeam,
      usernamesMap,
    );
    anonymizedRecord.playerUsernamesOrdered = anonymizeArray(
      record.playerUsernamesOrdered,
      usernamesMap,
    );
    anonymizedRecord.playerUsernamesOrderedReversed = anonymizeArray(
      record.playerUsernamesOrderedReversed,
      usernamesMap,
    );
    anonymizedRecord.ladyHistoryUsernames = anonymizeArray(
      record.ladyHistoryUsernames,
      usernamesMap,
    );
    anonymizedRecord.refHistoryUsernames = anonymizeArray(
      record.refHistoryUsernames,
      usernamesMap,
    );
    anonymizedRecord.sireHistoryUsernames = anonymizeArray(
      record.sireHistoryUsernames,
      usernamesMap,
    );
    anonymizedRecord.voteHistory = anonymizeMapKeys(
      record.voteHistory,
      usernamesMap,
    );
    anonymizedRecord.playerRoles = anonymizeMapKeys(
      record.playerRoles,
      usernamesMap,
    );
    anonymizedRecords.push(anonymizedRecord);
  }
  return anonymizedRecords;
};

const hardUpdateStatsFunction = function () {
  console.log('Starting hard update stats...');
  processRecords();
};

const processRecords = async function (records) {
  const numOfRecords = await gameRecord.countDocuments();
  const recordsPerLoop = 100;

  // Delete the current gamerecord json files.
  try {
    fs.unlinkSync('assets/gameRecordsData/gameRecordsDataAnon_orig.json');
  } catch (e) {
    // Don't worry if any of this fails
  }
  try {
    fs.unlinkSync('assets/gameRecordsData/gameRecordsData.json');
  } catch (e) {
    // Don't worry if any of this fails
  }

  // Create a file stream to write out the data synchronously
  let anonStream = fs.createWriteStream(
    'assets/gameRecordsData/gameRecordsDataAnon_orig.json',
    { flags: 'a' },
  );

  let numBotGames = 0;

  // Set up the object that stores the stats
  const obj = {};
  //* *********************************************
  // Site traffic stats - one data point per day
  //* *********************************************
  const gamesPlayedData = {};
  const xAxisVars = [];
  const yAxisVars = [];

  //* *********************************************
  // Getting the average duration of each game
  //* *********************************************
  let averageGameDuration = new Date(0);

  //* *********************************************
  // Getting the win rate of alliances globally
  //* *********************************************
  let resWins = 0;
  let spyWins = 0;

  //* *********************************************
  // Getting the assassination win rate
  //* *********************************************
  const rolesShotObj = {};

  //* *********************************************
  // Getting the average duration of each assassination
  //* *********************************************
  let averageAssassinationDuration = new Date(0);
  let count = 0;

  //* *********************************************
  // Getting the win rate for each game size
  //* *********************************************
  const gameSizeWins = {};

  //* *********************************************
  // Getting the spy wins breakdown
  //* *********************************************
  const spyWinBreakdown = {};

  //* *********************************************
  // Getting the Lady of the lake wins breakdown
  //* *********************************************
  const ladyBreakdown = {
    resStart: { resWin: 0, spyWin: 0 },
    spyStart: { resWin: 0, spyWin: 0 },
  };

  //* *********************************************
  // Getting the average duration of each game
  //* *********************************************
  const averageGameDurations = [];
  const countForGameSize = [];
  for (let i = 5; i < 11; i++) {
    averageGameDurations[i] = new Date(0);
    countForGameSize[i] = 0;
  }

  for (let loopNum = 0; loopNum < numOfRecords / recordsPerLoop; loopNum++) {
    const skipNumber = loopNum * recordsPerLoop;

    records = await gameRecord
      .find({})
      .sort({ timeGameFinished: 'descending' })
      .skip(skipNumber)
      .limit(recordsPerLoop);

    const prevRecordsLength = records.length;
    // TODO fs.writeFileSync('assets/gameRecordsData/gameRecordsData.json', JSON.stringify(records));
    // Filter out the bot games
    records = records.filter(
      (r) =>
        r.gameMode === undefined ||
        r.gameMode.toLowerCase().includes('bot') == false,
    );

    // Keep track of number of bot games
    numBotGames += prevRecordsLength - records.length;

    // Anonymize it using gameRecordsData
    const gameRecordsDataAnon = anonymizeStats(records);

    // Write out to anon stream
    anonStream.write(JSON.stringify(gameRecordsDataAnon));

    //* *********************************************
    // Site traffic stats - one data point per day
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      const timeFinish = records[i].timeGameFinished;
      // Round to nearest day
      const dayFinished = new Date(
        timeFinish.getFullYear(),
        timeFinish.getMonth(),
        timeFinish.getDate(),
      );

      // Count the number of games played on the same day
      if (gamesPlayedData[dayFinished.getTime()] === undefined) {
        gamesPlayedData[dayFinished.getTime()] = 1;
      } else {
        gamesPlayedData[dayFinished.getTime()] =
          gamesPlayedData[dayFinished.getTime()] + 1;
      }
    }

    //* *********************************************
    // Getting the average duration of each game
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      var duration = new Date(
        records[i].timeGameFinished.getTime() -
          records[i].timeGameStarted.getTime(),
      );
      averageGameDuration = new Date(
        averageGameDuration.getTime() + duration.getTime(),
      );
    }

    //* *********************************************
    // Getting the win rate of alliances globally
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      if (records[i].winningTeam === Alliance.Resistance) {
        resWins++;
      } else if (records[i].winningTeam === Alliance.Spy) {
        spyWins++;
      }
    }

    //* *********************************************
    // Getting the assassination win rate
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      const roleShot = records[i].whoAssassinShot;
      if (roleShot) {
        // console.log("a");
        if (rolesShotObj[roleShot] !== undefined) {
          rolesShotObj[roleShot] = rolesShotObj[roleShot] + 1;
          // console.log(roleShot + " was shot, total count: " + rolesShotObj[roleShot]);
        } else {
          rolesShotObj[roleShot] = 1;
        }
      }
    }

    //* *********************************************
    // Getting the average duration of each assassination
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      if (records[i].timeAssassinationStarted) {
        var duration = new Date(
          records[i].timeGameFinished.getTime() -
            records[i].timeAssassinationStarted.getTime(),
        );
        averageAssassinationDuration = new Date(
          averageAssassinationDuration.getTime() + duration.getTime(),
        );
        count++;
      }
    }

    //* *********************************************
    // Getting the win rate for each game size
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      if (!gameSizeWins[records[i].numberOfPlayers]) {
        gameSizeWins[records[i].numberOfPlayers] = {};
        gameSizeWins[records[i].numberOfPlayers].spy = 0;
        gameSizeWins[records[i].numberOfPlayers].res = 0;
      }

      if (records[i].winningTeam === Alliance.Spy) {
        gameSizeWins[records[i].numberOfPlayers].spy++;
      } else if (records[i].winningTeam === Alliance.Resistance) {
        gameSizeWins[records[i].numberOfPlayers].res++;
      } else {
        console.log(
          `error, winning team not recognised: ${records[i].winningTeam}`,
        );
      }
    }

    //* *********************************************
    // Getting the spy wins breakdown
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      if (records[i].winningTeam === Alliance.Spy) {
        if (!spyWinBreakdown[records[i].howTheGameWasWon]) {
          spyWinBreakdown[records[i].howTheGameWasWon] = 0;
        }

        spyWinBreakdown[records[i].howTheGameWasWon]++;
      }
    }

    //* *********************************************
    // Getting the Lady of the lake wins breakdown
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      if (records[i].ladyChain.length > 0) {
        // if the first person who held the card is a res
        if (resRoles.indexOf(records[i].ladyChain[0]) !== -1) {
          if (records[i].winningTeam === Alliance.Resistance) {
            ladyBreakdown.resStart.resWin++;
          } else if (records[i].winningTeam === Alliance.Spy) {
            ladyBreakdown.resStart.spyWin++;
          }
        }
        // if the first person who held the card is a spy
        else if (spyRoles.indexOf(records[i].ladyChain[0]) !== -1) {
          if (records[i].winningTeam === Alliance.Resistance) {
            ladyBreakdown.spyStart.resWin++;
          } else if (records[i].winningTeam === Alliance.Spy) {
            ladyBreakdown.spyStart.spyWin++;
          }
        } else {
          console.log(
            `ERROR no alliance assigned to role: ${records[i].ladyChain[0]}`,
          );
        }
      }
    }

    //* *********************************************
    // Getting the average duration of each game
    //* *********************************************
    for (let i = 0; i < records.length; i++) {
      const duration = new Date(
        records[i].timeGameFinished.getTime() -
          records[i].timeGameStarted.getTime(),
      );
      averageGameDurations[records[i].numberOfPlayers] = new Date(
        averageGameDurations[records[i].numberOfPlayers].getTime() +
          duration.getTime(),
      );
      countForGameSize[records[i].numberOfPlayers]++;
    }

    console.log(
      Math.round((loopNum / (numOfRecords / recordsPerLoop)) * 10000) / 100 +
        '% percent processed.',
    );
  }

  // Post data gathering

  obj.totalgamesplayed = numOfRecords - numBotGames;

  //* *********************************************
  // Site traffic stats - one data point per day
  //* *********************************************
  const gamesPlayedDataArray = [];
  // Turn it into an array of objects
  for (const key in gamesPlayedData) {
    if (gamesPlayedData.hasOwnProperty(key)) {
      const newObj = {
        date: key,
        value: gamesPlayedData[key],
      };

      gamesPlayedDataArray.push(newObj);
    }
  }
  // Sort it
  gamesPlayedDataArray.sort(gameDateCompare);
  // Split it into the two axis
  for (let i = 0; i < gamesPlayedDataArray.length; i++) {
    xAxisVars.push(gamesPlayedDataArray[i].date);
    yAxisVars.push(gamesPlayedDataArray[i].value);
    // yAxisVars.push(new Date(gamesPlayedDataArray[i].value)); // This line seems to make server hang..?
  }
  // Remove the last entry since the day isn't over yet...
  xAxisVars.pop();
  yAxisVars.pop();
  obj.siteTrafficGamesPlayedXAxis = xAxisVars;
  obj.siteTrafficGamesPlayedYAxis = yAxisVars;

  //* *********************************************
  // Getting the average duration of each game
  //* *********************************************
  obj.averageGameDuration = new Date(
    averageGameDuration.getTime() / obj.totalgamesplayed,
  );

  //* *********************************************
  // Getting the win rate of alliances globally
  //* *********************************************
  obj.totalResWins = resWins;
  obj.totalSpyWins = spyWins;

  //* *********************************************
  // Getting the win rate of alliances globally
  //* *********************************************
  obj.assassinRolesShot = rolesShotObj;

  //* *********************************************
  // Getting the average duration of each assassination
  //* *********************************************
  obj.averageAssassinationDuration = new Date(
    averageAssassinationDuration.getTime() / count,
  );

  //* *********************************************
  // Getting the win rate for each game size
  //* *********************************************
  obj.gameSizeWins = gameSizeWins;

  //* *********************************************
  // Getting the spy wins breakdown
  //* *********************************************
  obj.spyWinBreakdown = spyWinBreakdown;

  //* *********************************************
  // Getting the Lady of the lake wins breakdown
  //* *********************************************
  obj.ladyBreakdown = ladyBreakdown;

  //* *********************************************
  // Getting the average duration of each game
  //* *********************************************
  obj['5paverageGameDuration'] = new Date(
    averageGameDurations[5].getTime() / countForGameSize['5'],
  );
  obj['6paverageGameDuration'] = new Date(
    averageGameDurations[6].getTime() / countForGameSize['6'],
  );
  obj['7paverageGameDuration'] = new Date(
    averageGameDurations[7].getTime() / countForGameSize['7'],
  );
  obj['8paverageGameDuration'] = new Date(
    averageGameDurations[8].getTime() / countForGameSize['8'],
  );
  obj['9paverageGameDuration'] = new Date(
    averageGameDurations[9].getTime() / countForGameSize['9'],
  );
  obj['10paverageGameDuration'] = new Date(
    averageGameDurations[10].getTime() / countForGameSize['10'],
  );

  obj.timeCreated = new Date();

  const clientStatsData = obj;

  console.log('Done processing, now saving.');

  statsCumulative.remove({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Removed past cumulative object');
      statsCumulative.create(
        { data: JSON.stringify(clientStatsData) },
        (err) => {
          console.log('Successfully saved new cumulative object');
        },
      );
    }
  });

  console.log(numOfRecords);

  anonStream.end();
  return;
};

router.get('/updateStats', (req, res) => {
  setTimeout(hardUpdateStatsFunction, 1000);
  res.send('Starting update...');
});

router.get('/ajax/profile/getProfileData/:profileUsername', (req, res) => {
  User.findOne({ username: req.params.profileUsername }, (err, foundUser) => {
    if (err) {
      console.log(err);
      res.status(200).send('error');
    } else if (foundUser) {
      const sendUserData = {};
      sendUserData.username = foundUser.username;
      sendUserData.avatarImgRes = foundUser.avatarImgRes;
      sendUserData.avatarImgSpy = foundUser.avatarImgSpy;
      sendUserData.nationality = foundUser.nationality;
      sendUserData.nationCode = foundUser.nationCode;
      sendUserData.dateJoined = foundUser.dateJoined;
      sendUserData.biography = foundUser.biography;
      sendUserData.hideStats = foundUser.hideStats;

      if (!foundUser.hideStats) {
        sendUserData.totalGamesPlayed = foundUser.totalGamesPlayed;
        sendUserData.totalWins = foundUser.totalWins;
        sendUserData.totalLosses = foundUser.totalLosses;
        sendUserData.totalTimePlayed = foundUser.totalTimePlayed;
        sendUserData.roleStats = foundUser.roleStats;
        sendUserData.totalResWins = foundUser.totalResWins;
        sendUserData.totalResLosses = foundUser.totalResLosses;
      }

      res
        .status(200)
        .send({ userData: sendUserData, roleAlliances: rolesToAlliances });
    }
  });
  // console.log("Received AJAX request");
});

router.get('/ajax/seenNotification', (req, res) => {
  // console.log("seen nofication");
  // console.log(req.query.idOfNotif);

  // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));

  myNotification.findById(
    mongoose.Types.ObjectId(req.query.idOfNotif),
    (err, notif) => {
      if (err) {
        console.log(err);
      }
      if (notif && notif !== null && notif !== undefined) {
        notif.seen = true;
        const promiseReturned = notif.save();

        promiseReturned.then(() => {
          User.findOne({ username: req.user.username })
            .populate('notifications')
            .exec(async (err, foundUser) => {
              foundUser.markModified('notifications');
              await foundUser.save();
            });
        });
      }
    },
  );

  res.status(200).send('done');
});

router.get('/ajax/hideNotification', (req, res) => {
  // console.log("hide notification");
  // console.log(req.query.idOfNotif);

  // console.log(mongoose.Types.ObjectId(req.query.idOfNotif));
  myNotification.findByIdAndRemove(
    mongoose.Types.ObjectId(req.query.idOfNotif),
    (err) => {
      if (err) {
        console.log(err);
      }

      if (req !== undefined && req.user !== undefined) {
        User.findOne({ username: req.user.username })
          .populate('notifications')
          .exec(async (err, foundUser) => {
            foundUser.markModified('notifications');
            await foundUser.save();
          });
      }
    },
  );

  res.status(200).send('done');
});

router.get('/ajax/hideAllNotifications', (req, res) => {
  // console.log("hide all nofications");

  User.findById(req.user._id)
    .populate('notifications')
    .exec(async (err, foundUser) => {
      if (err) {
        console.log(err);
      }
      // console.log(foundUser.notifications);

      foundUser.notifications.forEach((notif) => {
        // console.log("removing notif");
        // console.log(notif);
        myNotification.findByIdAndRemove(notif._id, (err) => {
          // console.log("callback");
        });
      });

      foundUser.notifications = [];

      foundUser.markModified('notifications');
      foundUser.save();
    });
  res.status(200).send('done');
});

function sanitiseUsername(req, res, next) {
  req.body.username = sanitizeHtml(req.body.username, {
    allowedTags: [],
    allowedAttributes: [],
  });

  next();
}

function setCookieDisplayUsername(req, res, next) {
  res.cookie('displayUsername', req.body.username);
  next();
}

function sanitiseEmail(req, res, next) {
  req.body.emailAddress = sanitizeHtml(req.body.emailAddress, {
    allowedTags: [],
    allowedAttributes: [],
  });

  req.body.emailAddress = req.body.emailAddress.toLowerCase();

  next();
}

function disableRegistrationMiddleware(req, res, next) {
  if (Settings.getDisableRegistration()) {
    req.flash(
      'error',
      'Registration is temporarily disabled. Please contact a moderator via discord if you would like to create an account.',
    );
    res.redirect('/');
    return;
  }

  next();
}

export default router;

function usernameContainsBadCharacter(str) {
  // only allow alphanumerical
  const regx = /^[A-Za-z0-9]+$/;

  if (
    str.includes('&amp;') ||
    str.includes('&lt;') ||
    str.includes('&gt;') ||
    str.includes('&apos;') ||
    str.includes('&quot;') ||
    str.includes('[') ||
    str.includes(']') ||
    str.includes('/') ||
    str.includes('\\') ||
    str.includes('&') ||
    str.includes(';')
  ) {
    return true;
  }
  if (!regx.test(str)) {
    return true;
  }

  return false;
}

function escapeText(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/(?:\r\n|\r|\n)/g, ' <br>');
}
