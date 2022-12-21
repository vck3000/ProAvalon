import React from 'react';
import { Router } from 'express';
import { renderToString } from 'react-dom/server';

import { isModMiddleware } from './middleware';
import User from '../models/user';
import Ban from '../models/ban';
import ModLog from '../models/modLog';
import Report from '../models/report';
import {
  GetLastFiveMinsAllChat as GetLastFiveMinsAllChat,
  GetUserCurrentRoom,
  GetRoom,
  GetRoomChat,
} from '../sockets/sockets';

import ModLogComponent from '../views/components/mod/mod_log';
import ReportLog from '../views/components/mod/report';

const router = new Router();

router.get('/', isModMiddleware, (req, res) => {
  const logsReact = renderToString(<ModLogComponent />);

  res.render('mod/mod', {
    currentUser: req.user,
    isMod: true,
    headerActive: 'mod',
    logsReact,
  });
});

const requiredFields = [
  'banPlayerUsername',
  'reason',
  'duration',
  'duration_units',
  'descriptionByMod',
];

router.post('/ban', isModMiddleware, async (req, res) => {
  try {
    // Catch errors so that it's not shown to users.
    // Multiple checks:
    // 1: All fields are filled in and valid
    for (var s of requiredFields) {
      if (req.body[s] === undefined || req.body[s] === '') {
        res.status(400);
        res.send(`Missing parameter: '${s}'.`);
        return;
      }
    }

    // 1b: Check that duration is a strict number:
    const durationInt = parseInt(Number(req.body['duration']), 10);
    if (isNaN(durationInt)) {
      res.status(400);
      res.send(`Duration must be a number, not: '${req.body['duration']}'.`);
      return;
    }

    // 2: Either userban or IP ban or BOTH checkboxes must be ticked.
    var boxCount = 0;
    if (req.body['userBanCheckbox'] === 'on') {
      boxCount++;
    }
    if (req.body['IPBanCheckbox'] === 'on') {
      boxCount++;
    }
    if (req.body['SingleIPBanCheckbox'] === 'on') {
      boxCount++;
    }

    // Prohibit both choices. Can only have one.
    if (
      req.body['IPBanCheckbox'] === 'on' &&
      req.body['SingleIPBanCheckbox'] === 'on'
    ) {
      res.status(400);
      res.send('May not select both IP ban checkboxes.');
      return;
    }

    if (boxCount < 1) {
      res.status(400);
      res.send('Must select at least one type of ban.');
      return;
    }

    const banUser = await User.findOne({
      usernameLower: req.body['banPlayerUsername'].toLowerCase(),
    });
    if (!banUser) {
      res.status(400);
      res.send(`${req.body['banPlayerUsername']} was not found.`);
      return;
    }

    if (!req.user) {
      res.status(400);
      res.send('Cannot find who you are.');
      return;
    }
    const modUser = req.user;

    // Single IP ban configuration:
    var ipsToBan;
    if (req.body['SingleIPBanCheckbox'] === 'on') {
      ipsToBan = banUser.lastIPAddress;
    } else {
      ipsToBan = banUser.IPAddresses;
    }

    // Get duration for ban:
    const now = new Date();
    const whenMade = new Date();
    var whenRelease;
    switch (req.body['duration_units']) {
      case 'hrs':
        whenRelease = new Date(now.setHours(now.getHours() + durationInt));
        break;
      case 'days':
        whenRelease = new Date(now.setDate(now.getDate() + durationInt));
        break;
      case 'months':
        whenRelease = new Date(now.setMonth(now.getMonth() + durationInt));
        break;
      case 'years':
        whenRelease = new Date(
          now.setFullYear(now.getFullYear() + durationInt),
        );
        break;
      case 'permaban':
        whenRelease = new Date(now.setFullYear(now.getFullYear() + 1000));
        break;
      default:
        res.status(400);
        res.send(`Invalid duration units: '${req.body['duration_units']}'.`);
        return;
    }

    // Create the data object
    const banData = {
      ipBan:
        req.body['IPBanCheckbox'] === 'on' ||
        req.body['SingleIPBanCheckbox'] === 'on'
          ? true
          : false,
      singleIPBan: req.body['SingleIPBanCheckbox'] === 'on' ? true : false,
      userBan: req.body['userBanCheckbox'] === 'on' ? true : false,
      bannedPlayer: {
        id: banUser._id,
        username: banUser.username,
        usernameLower: banUser.usernameLower,
      },
      bannedIPs: ipsToBan,
      modWhoBanned: {
        id: modUser._id,
        username: modUser.username,
        usernameLower: modUser.usernameLower,
      },
      whenMade: whenMade,
      durationToBan: `${req.body['duration']} ${req.body['duration_units']}`,
      whenRelease: whenRelease,
      descriptionByMod: req.body['descriptionByMod'],
      reason: req.body.reason,
    };

    // console.log(banData);
    await Ban.create(banData);

    // Create mod log
    await ModLog.create({
      type: 'ban',
      modWhoMade: {
        id: modUser._id,
        username: modUser.username,
        usernameLower: modUser.usernameLower,
      },
      data: banData,
      dateCreated: new Date(),
    });

    res.status(200);
    res.send('The ban was successfully made.');
    return;
  } catch (e) {
    console.log(e);
    res.status(400);
    res.send('Something went terribly wrong...');
  }
});

// Get the moderation logs to show

// 1) Bans
// 2) Mutes
// 3) Forum removes
// 4) Comment and reply removes
// 5) Avatar request approve/rejects
router.get('/ajax/logData/:pageIndex', isModMiddleware, (req, res) => {
  // get all the mod actions
  let pageIndex;
  if (req.params.pageIndex) {
    pageIndex = req.params.pageIndex;
    if (pageIndex < 0) {
      pageIndex = 0;
    }

    const NUM_OF_RESULTS_PER_PAGE = 10;
    // Page 0 is the first page.
    const skipNumber = pageIndex * NUM_OF_RESULTS_PER_PAGE;

    ModLog.find({})
      .sort({ dateCreated: 'descending' })
      .skip(skipNumber)
      .limit(NUM_OF_RESULTS_PER_PAGE)
      .exec(async (err, logs) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send(logs);
        }
      });
  }
});

// See report page
router.get('/report', isModMiddleware, (req, res) => {
  const reportsReact = renderToString(<ReportLog />);

  res.render('mod/report', { reportsReact });
});

// Create a new report
router.post('/report', async (req, res) => {
  const userWhoReported = req.user;
  const reportedUser = await User.findOne({
    usernameLower: req.body.player.toLowerCase(),
  });

  if (!userWhoReported) {
    res.status(400);
    res.send('Something went wrong. Please re-login.');
    return;
  }

  if (!reportedUser) {
    res.status(400);
    res.send(`${req.body.player} was not found.`);
    return;
  }

  // Extract All Chat and Room Chat
  // Sample chat data
  // {
  //   date: 21,
  //   message: 'asd',
  //   username: "ProNub <span class='badge' data-toggle='tooltip' data-placement='right' title='Admin' style='transform: scale(0.9) translateY(-9%); background-color: rgb(150, 150, 150)'>A</span>",
  //   dateCreated: 2022-01-20T05:21:18.814Z (date object)
  // },
  const extractChatToStr = (messages) =>
    messages
      .map((chat) => {
        if (chat.username) {
          return `[${new Date(chat.dateCreated).toISOString()}] ${
            chat.username.split(' ')[0]
          }: ${chat.message}`;
        }

        return `[${new Date(chat.dateCreated).toISOString()}] ${chat.message}`;
      })
      .join('\n');

  const allChat5Mins = GetLastFiveMinsAllChat();
  const allChatMessageString = extractChatToStr(allChat5Mins);

  const roomId = GetUserCurrentRoom(userWhoReported.username);
  const roomChat = roomId ? GetRoomChat(roomId) : [];
  const roomChatMessageString = extractChatToStr(roomChat);

  // Collect Role information
  const roles = roomId
    ? GetRoom(roomId)
        .playersInGame.map(
          (user) => `${user.username}: ${user.role.toUpperCase()}`,
        )
        .join('\n')
    : '';

  // Collect Vote History
  const voteHistory = roomId ? JSON.stringify(GetRoom(roomId).voteHistory) : '';

  Report.create({
    reason: req.body.reason,
    reportedPlayer: {
      username: reportedUser.username.toLowerCase(),
      id: reportedUser._id,
    },
    playerWhoReported: {
      id: userWhoReported._id,
      username: userWhoReported.username.toLowerCase(),
    },
    description: req.body.desc,
    date: new Date(),
    allChat5Mins: allChatMessageString,
    roomChat: roomChatMessageString,
    roles,
    voteHistory,
  });

  res.status(200);
  res.send('Report created succesfully. A mod will review it shortly.');
});

// API Endpoints
router.get('/report/unresolved', isModMiddleware, async (req, res) => {
  // TODO Check this
  const reports = await Report.find({ resolved: false }).sort({ date: -1 });

  res.send(reports);
});

router.get('/report/resolved/:pageIndex', isModMiddleware, async (req, res) => {
  if (!req.params.pageIndex) {
    res.status(400);
    res.send('Missing pageIndex.');
    return;
  }

  const pageIndex = req.params.pageIndex;

  const NUM_OF_RESULTS_PER_PAGE = 10;
  const skipNumber = pageIndex * NUM_OF_RESULTS_PER_PAGE;

  const reports = await Report.find({ resolved: true })
    .sort({ date: -1 })
    .skip(skipNumber)
    .limit(NUM_OF_RESULTS_PER_PAGE);

  res.send(reports);
});

// Resolve a report
router.post('/report/resolve', isModMiddleware, async (req, res) => {
  const modUser = req.user;
  const id = req.body.id;

  Report.findByIdAndUpdate(
    id,
    {
      modWhoResolved: {
        id: modUser.id,
        username: modUser.usernameLower,
      },
      modComment: req.body.modComment,
      resolved: true,
    },
    (err) => {
      if (err) {
        res.status(400);
        res.send(err);
      } else {
        res.send('Success!');
      }
    },
  );
});

export default router;
