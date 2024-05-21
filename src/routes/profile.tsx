// @ts-nocheck
import express from 'express';
import sanitizeHtml from 'sanitize-html';
import url from 'url';
import { checkProfileOwnership, isModMiddleware } from './middleware';
import User from '../models/user';
import avatarRequest from '../models/avatarRequest';
import ModLog from '../models/modLog';
import { createNotification } from '../myFunctions/createNotification';
import multer from 'multer';
import imageSize from 'image-size';
import S3Controller from '../clients/s3/S3Controller';
import { S3Agent } from '../clients/s3/S3Agent';
import { PatreonAgent } from '../clients/patreon/patreonAgent';
import { PatreonController } from '../clients/patreon/patreonController';
import { getPatreonRewardTierForUser } from '../rewards/getRewards';
import AvatarRequest from '../models/avatarRequest';
import { renderToString } from 'react-dom/server';
import AvatarHome from '../views/components/avatarHome';
import React from 'react';
import { isMod } from '../modsadmins/mods';

const s3Controller = new S3Controller();
const s3Agent = new S3Agent(s3Controller);

const patreonAgent = new PatreonAgent(new PatreonController());

const router = express.Router();

const MAX_ACTIVE_AVATAR_REQUESTS = 2;
const MIN_GAMES_REQUIRED = 100;
const VALID_DIMENSIONS = [128, 1024];
const VALID_DIMENSIONS_STR = '128x128px or 1024x1024px';
const MAX_FILESIZE = 1048576; // 1MB
const MAX_FILESIZE_STR = '1MB';

const sanitizeHtmlAllowedTagsForumThread = [
  'img',
  'iframe',
  'h1',
  'h2',
  'u',
  'span',
  'br',
];
const sanitizeHtmlAllowedAttributesForumThread = {
  a: ['href', 'name', 'target'],
  img: ['src', 'style'],
  iframe: ['src', 'style'],
  // '*': ['style'],
  table: ['class'],

  p: ['style'],

  span: ['style'],
  b: ['style'],
};

// Show the mod approving rejecting page
router.get('/avatargetlinktutorial', (req, res) => {
  res.render('profile/avatargetlinktutorial');
});

// Show the mod approving rejecting page
router.get('/mod/customavatar', isModMiddleware, (req, res) => {
  avatarRequest.find({ processed: false }).exec((err, allAvatarRequests) => {
    if (err) {
      console.log(err);
    } else {
      res.render('mod/customavatar', {
        customAvatarRequests: allAvatarRequests,
        MAX_FILESIZE_STR,
        VALID_DIMENSIONS_STR,
      });
    }
  });
});

// moderator approve or reject custom avatar requests
router.post(
  '/mod/ajax/processavatarrequest',
  isModMiddleware,
  async (req, res) => {
    if (typeof req.body.decision !== 'boolean') {
      throw new Error(
        `Unrecognisable mod decision to process custom avatar request: decision="${
          req.body.decision
        }" type=${typeof req.body.decision}`,
      );
    }

    const avatarReq = await avatarRequest.findById(req.body.avatarreqid);
    const userRequestingAvatar = await User.findOne({
      usernameLower: avatarReq.forUsername.toLowerCase(),
    });

    const modWhoProcessed = req.user;
    const decision = req.body.decision;
    const modComment = req.body.modcomment
      ? sanitizeHtml(req.body.modcomment)
      : 'No message provided.';

    if (decision) {
      const approvedAvatarLinks = await s3Agent.approveAvatarRequest({
        resLink: avatarReq.resLink,
        spyLink: avatarReq.spyLink,
      });

      avatarReq.resLink = approvedAvatarLinks.resLink;
      avatarReq.spyLink = approvedAvatarLinks.spyLink;
      avatarReq.processed = true;
      avatarReq.modComment = modComment;
      avatarReq.approved = decision;
      avatarReq.modWhoProcessed = modWhoProcessed.username;

      await avatarReq.save();

      userRequestingAvatar.avatarImgRes = avatarReq.resLink;
      userRequestingAvatar.avatarImgSpy = avatarReq.spyLink;

      await userRequestingAvatar.save();

      let str = `Your avatar request was approved by ${modWhoProcessed.username}! Their comment was: "${modComment}"`;
      createNotification(
        userRequestingAvatar._id,
        str,
        '#',
        modWhoProcessed.username,
      );
    } else {
      await s3Agent.rejectAvatarRequest({
        resLink: avatarReq.resLink,
        spyLink: avatarReq.spyLink,
      });

      let str = `Your avatar request was rejected by ${modWhoProcessed.username}. Their comment was: "${modComment}"`;
      createNotification(
        userRequestingAvatar._id,
        str,
        '#',
        modWhoProcessed.username,
      );
    }

    // Create mod log - Doesn't need to be async
    ModLog.create({
      type: 'avatar',
      modWhoMade: {
        id: modWhoProcessed._id,
        username: modWhoProcessed.username,
        usernameLower: modWhoProcessed.usernameLower,
      },
      data: {
        modComment: modComment,
        approved: decision,
        username: avatarReq.forUsername,
        msgToMod: avatarReq.msgToMod,
        resLink: decision ? avatarReq.resLink : null,
        spyLink: decision ? avatarReq.spyLink : null,
      },
      dateCreated: new Date(),
    });

    if (decision) {
      console.log(
        `Custom avatar request approved: forUser="${avatarReq.forUsername}" byMod="${modWhoProcessed.username}" modComment="${modComment}" resLink="${avatarReq.resLink}" spyLink="${avatarReq.spyLink}"`,
      );
    } else {
      console.log(
        `Custom avatar request rejected: forUser="${avatarReq.forUsername}" byMod="${modWhoProcessed.username}" modComment="${modComment}"`,
      );

      await avatarReq.remove();
    }

    const result = decision ? 'approved' : 'rejected';
    res.status(200).send(`The custom avatar request has been ${result}.`);
  },
);

// Show the user's avatar homepage
router.get(
  '/:profileUsername/avatarhome',
  checkProfileOwnership,
  async (req, res) => {
    const user = await User.findOne({
      usernameLower: req.params.profileUsername.toLowerCase(),
    });

    await s3Agent.updateUsersAvatarLibrary(req.user.usernameLower);

    // TODO-kev: Remove below once library is fully updated. Remains for testing purposes
    const approvedAvatarSetsQuery = await AvatarRequest.find({
      forUsername: user.usernameLower,
    });

    let approvedAvatarSets = [];

    approvedAvatarSetsQuery.forEach((avatarSet) => {
      const approvedAvatarSet = {
        resLink: avatarSet.resLink,
        spyLink: avatarSet.spyLink,
      };
      approvedAvatarSets.push(approvedAvatarSet);
    });

    const currentPatreon = true;
    const avatarHomeReact = renderToString(<AvatarHome />);

    res.render('profile/avatarhome', {
      username: user.username,
      avatarImgRes: user.avatarImgRes,
      avatarImgSpy: user.avatarImgSpy,
      approvedAvatarSets,
      currentPatreon,
      avatarHomeReact,
    });
  },
);

// Get a users avatar library links
router.get(
  '/:profileUsername/avatar/getallavatars',
  checkProfileOwnership,
  async (req, res) => {
    const user = await User.findOne({
      usernameLower: req.user.usernameLower,
    });

    const result = {
      currentResLink: user.avatarImgRes,
      currentSpyLink: user.avatarImgSpy,
      avatarLibrary: await s3Agent.getUsersAvatarLibraryLinks(
        user.usernameLower,
      ),
    };

    res.status(200).send(result);
  },
);

// Change a users current avatar
router.post(
  '/:profileUsername/avatar/changeavatar',
  checkProfileOwnership,
  async (req, res) => {
    const patronDetails = await patreonAgent.findOrUpdateExistingPatronDetails(
      req.user.usernameLower,
    );

    if (!isMod(req.user.username) && !patronDetails.isPledgeActive) {
      return res
        .status(403)
        .send('You need to be a Patreon Supporter to enable this feature.');
    }

    const user = await User.findOne({
      usernameLower: req.user.usernameLower,
    });

    if (!user.avatarLibrary.includes(req.body.avatarId)) {
      return res
        .status(400)
        .send('Unable to use an avatar that is not in your avatar library.');
    }
    if (
      user.avatarImgRes === req.body.resLink ||
      user.avatarImgSpy === req.body.spyLink
    ) {
      return res.status(400).send('You are already using this avatar.');
    }

    user.avatarImgRes = req.body.resLink;
    user.avatarImgSpy = req.body.spyLink;
    await user.save();

    res.status(200).send('Successfully changed avatar.');
  },
);

// TODO-kev: Delete below before final merge. Old route for testing purposes
// Change a users current avatar
router.post(
  '/:profileUsername/avatar/changeavatarold',
  checkProfileOwnership,
  async (req, res) => {
    const user = await User.findOne({
      usernameLower: req.params.profileUsername.toLowerCase(),
    });

    if (
      user.avatarImgRes === req.body.resLink ||
      user.avatarImgSpy === req.body.spyLink
    ) {
      res.status(400).send('You are already using this avatar.');
      return;
    }

    user.avatarImgRes = req.body.resLink;
    user.avatarImgSpy = req.body.spyLink;

    await user.save();

    res.status(200).send('Successfully changed avatar.');
  },
);

// Show the custom avatar submission page
router.get(
  '/:profileUsername/customavatar',
  checkProfileOwnership,
  (req, res) => {
    User.findOne(
      { usernameLower: req.params.profileUsername.toLowerCase() },
      (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          res.render('profile/changeavatar', {
            username: foundUser.username,
            MAX_FILESIZE_STR,
            VALID_DIMENSIONS,
            VALID_DIMENSIONS_STR,
          });
        }
      },
    );
  },
);

const storage = multer.memoryStorage();
const multerMiddleware = multer({
  storage: storage,
  limits: { fileSize: MAX_FILESIZE },
}).fields([
  // This is a whitelist, other files will not be accepted
  { name: 'avatarRes', maxCount: 1 },
  { name: 'avatarSpy', maxCount: 1 },
]);

type MulterFiles = {
  avatarRes: Express.Multer.File[];
  avatarSpy: Express.Multer.File[];
};

const upload = function (req, res, next) {
  multerMiddleware(req, res, function (err) {
    if (!err) {
      next();
      return;
    }

    if (!(err instanceof multer.MulterError)) {
      res.status(500).send();
      throw new Error(err);
    }

    let message = err.message;
    if (message === 'File too large') {
      message = `File size exceeds the limit: ${MAX_FILESIZE_STR}.`;
    }

    res.status(400).send(message);
  });
};

// Submit a custom avatar request
router.post(
  '/:profileUsername/customavatar',
  checkProfileOwnership,
  upload,
  async (req, res) => {
    const files: MulterFiles = req.files;

    const result = await validateUploadAvatarRequest(
      req.params.profileUsername,
      files,
    );

    if (!result.valid) {
      res.status(400).send(result.errMsg);
      return;
    }

    const msgToMod = req.body.msgToMod
      ? sanitizeHtml(req.body.msgToMod)
      : 'No message provided.';

    // Upload valid avatar requests to s3 bucket
    const avatarRes = files['avatarRes'][0];
    const avatarSpy = files['avatarSpy'][0];

    const avatarLinks = await s3Agent.uploadAvatarRequestImages(
      req.params.profileUsername,
      avatarRes.buffer,
      avatarSpy.buffer,
    );

    const avatarRequestData = {
      forUsername: req.params.profileUsername.toLowerCase(),
      resLink: avatarLinks.resLink,
      spyLink: avatarLinks.spyLink,
      msgToMod: msgToMod,
      dateRequested: new Date(),
      processed: false,
    };

    await avatarRequest.create(avatarRequestData);

    res
      .status(200)
      .send(
        'Your submission was received! Please wait for a moderator to process your request.',
      );

    console.log(
      `Received change avatar request: user="${req.params.profileUsername}" msgToMod="${msgToMod}" resLink=${avatarLinks.resLink} spyLink=${avatarLinks.spyLink}`,
    );
  },
);

async function validateUploadAvatarRequest(
  username: string,
  files: MulterFiles,
): Promise<{ valid: boolean; errMsg: string }> {
  if (username.includes('_')) {
    throw new Error(
      `Username ${username} includes an underscore! Bad! Avatar set up doesn't support this.`,
    );
  }

  const user = await User.findOne({ usernameLower: username.toLowerCase() });
  if (!user) {
    throw new Error(`User not found: ${username}`);
  }

  // Check: Does not exceed max active avatar requests
  {
    const totalActiveAvatarRequestsQuery = await avatarRequest.aggregate([
      {
        $match: {
          forUsername: user.username.toLowerCase(),
          processed: false,
        },
      },
      {
        $count: 'total',
      },
    ]);

    const totalActiveAvatarRequests =
      totalActiveAvatarRequestsQuery.length === 0
        ? 0
        : totalActiveAvatarRequestsQuery[0].total;

    if (totalActiveAvatarRequests >= MAX_ACTIVE_AVATAR_REQUESTS) {
      return {
        valid: false,
        errMsg: `You cannot submit more than ${MAX_ACTIVE_AVATAR_REQUESTS} active custom avatar requests.`,
      };
    }
  }

  // Check: Both a singular res and spy avatar were submitted
  if (
    !files['avatarRes'] ||
    !files['avatarSpy'] ||
    files['avatarRes'].length !== 1 ||
    files['avatarSpy'].length !== 1
  ) {
    return {
      valid: false,
      errMsg: `You must submit both a Resistance and Spy avatar.`,
    };
  }

  const avatarRes = files['avatarRes'][0];
  const avatarSpy = files['avatarSpy'][0];

  // Check: Files are of type png
  if (
    avatarRes.mimetype !== 'image/png' ||
    avatarSpy.mimetype !== 'image/png'
  ) {
    return {
      valid: false,
      errMsg: `You may only submit png files.`,
    };
  }

  // Check: File dimensions are valid
  const dimRes = imageSize(avatarRes.buffer);
  const dimSpy = imageSize(avatarSpy.buffer);

  if (
    !VALID_DIMENSIONS.includes(dimRes.width) ||
    !VALID_DIMENSIONS.includes(dimRes.height) ||
    !VALID_DIMENSIONS.includes(dimSpy.width) ||
    !VALID_DIMENSIONS.includes(dimSpy.height) ||
    dimRes.width !== dimRes.height ||
    dimSpy.width !== dimSpy.height
  ) {
    return {
      valid: false,
      errMsg: `Avatar dimensions must be ${VALID_DIMENSIONS_STR}. Your dimensions are: Res: ${dimRes.width}x${dimRes.height}px, Spy: ${dimSpy.width}x${dimSpy.height}px.`,
    };
  }

  const patreonRewards = await getPatreonRewardTierForUser(
    username.toLowerCase(),
  );

  // Check: Min game count satisfied. If user is a paid Patron, they can bypass this check
  if (!patreonRewards && user.totalGamesPlayed < MIN_GAMES_REQUIRED) {
    return {
      valid: false,
      errMsg: `You must play at least 100 games to submit a custom avatar request. You have played ${user.totalGamesPlayed} games.`,
    };
  }

  // Passed all checks
  return {
    valid: true,
    errMsg: ``,
  };
}

// Show the change password edit page
router.get(
  '/:profileUsername/changepassword',
  checkProfileOwnership,
  (req, res) => {
    User.findOne(
      { usernameLower: req.params.profileUsername.toLowerCase() },
      (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          res.render('profile/changepassword', {
            username: foundUser.username,
          });
        }
      },
    );
  },
);

// Update the password
router.post(
  '/:profileUsername/changepassword',
  checkProfileOwnership,
  async (req, res) => {
    console.log(
      `Received a change password request from ${req.params.profileUsername.toLowerCase()}`,
    );

    const oldPW = req.body.oldPassword;
    const newPW = req.body.newPassword;
    const newPWConf = req.body.newPasswordConfirm;

    if (newPW === undefined || newPW === null) {
      req.flash('error', 'Please enter a new password.');
      res.redirect(`/profile/${req.params.profileUsername}/changepassword`);
    } else if (oldPW === undefined || oldPW === null) {
      req.flash('error', 'Please enter your old password.');
      res.redirect(`/profile/${req.params.profileUsername}/changepassword`);
    } else if (newPW !== newPWConf) {
      req.flash('error', 'Your new passwords did not match. Please try again.');
      res.redirect(`/profile/${req.params.profileUsername}/changepassword`);
    } else if (newPW.length < 4) {
      req.flash(
        'error',
        'Please enter a password that is longer than 3 characters',
      );
      res.redirect(`/profile/${req.params.profileUsername}/changepassword`);
    } else {
      const theUser = req.user;
      await theUser.changePassword(oldPW, newPW, (err) => {
        if (err) {
          req.flash('error', err.message);
          res.redirect(`/profile/${req.params.profileUsername}/changepassword`);
        } else {
          console.log('Success');
          req.flash('success', 'Your password has been successfully changed.');
          res.redirect(`/profile/${req.params.profileUsername}`);
        }
      });
    }
  },
);

const CLIENT_ID = process.env.patreon_client_ID;
const redirectURL = process.env.patreon_redirectURL;

const loginUrl = url.format({
  protocol: 'https',
  host: 'patreon.com',
  pathname: '/oauth2/authorize',
  query: {
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectURL,
    state: 'chill',
  },
});

// show the edit page
router.get(
  '/:profileUsername/edit',
  checkProfileOwnership,
  async (req, res) => {
    const patreonAgent = new PatreonAgent(new PatreonController());

    const patronDetails = await patreonAgent.findOrUpdateExistingPatronDetails(
      req.params.profileUsername.toLowerCase(),
    );

    const userData = await User.findOne({
      usernameLower: req.params.profileUsername.toLowerCase(),
    });

    return res.render('profile/edit', {
      userData,
      patronDetails,
    });
  },
);

// update a biography
router.post('/:profileUsername', checkProfileOwnership, (req, res) => {
  // console.log("biography update");
  // console.log(req.body.biography);
  // console.log(req.body.nationality);
  // console.log(req.body.nationCode);
  // console.log(req.body.hideStats);
  // console.log(req.body.pronoun);

  const allowedPronouns = [
    'he/him',
    'he/they',
    'she/her',
    'she/they',
    'they/them',
  ];

  if (!allowedPronouns.includes(req.body.pronoun)) {
    req.body.pronoun = 'N/A';
  }

  if (!req.body.biography) {
    req.body.biography = '';
  }

  if (req.body.nationality && req.body.nationCode) {
    // some browsers are screwing up and sending two nation codes back
    if (
      typeof req.body.nationCode === 'array' ||
      typeof req.body.nationCode === 'object'
    ) {
      req.body.nationCode = req.body.nationCode[req.body.nationCode.length - 1];
    }

    // if the user somehow doesn't input a nation code, default UN
    if (nationCodesAll.indexOf(req.body.nationCode) === -1) {
      req.body.nationCode = 'UN';
    }

    // If the user somehow doesn't input a valid nation, default to UN
    if (nationalitiesAll.indexOf(req.body.nationality) === -1) {
      req.body.nationality = 'United Nations';
    }

    User.find({ usernameLower: req.params.profileUsername.toLowerCase() })
      .populate('notifications')
      .exec((err, foundUser) => {
        foundUser = foundUser[0];

        if (err) {
          console.log(err);
        } else {
          foundUser.biography = sanitizeHtml(req.body.biography, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(
              sanitizeHtmlAllowedTagsForumThread,
            ),
            allowedAttributes: sanitizeHtmlAllowedAttributesForumThread,
          });

          foundUser.nationality = sanitizeHtml(req.body.nationality);
          foundUser.nationCode = sanitizeHtml(
            req.body.nationCode.toLowerCase(),
          );
          foundUser.hideStats = req.body.hideStats;
          foundUser.pronoun = req.body.pronoun;
          foundUser.save();

          res.redirect(`/profile/${foundUser.username}`);
        }
      });
  } else {
    res.redirect(`/profile/${req.params.profileUsername}`);
  }
});

// show the profile page
router.get('/:profileUsername', (req, res) => {
  User.findOne(
    { usernameLower: req.params.profileUsername.toLowerCase() },
    (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        res.render('profile/profile', {
          userData: foundUser,
          personViewingUsername: req.user.username,
        });
      }
    },
  );
});

export default router;

var nationCodesAll = [
  'UN',
  'AF',
  'AX',
  'AL',
  'DZ',
  'AS',
  'AD',
  'AO',
  'AI',
  'AQ',
  'AG',
  'AR',
  'AM',
  'AW',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BM',
  'BT',
  'BO',
  'BQ',
  'BA',
  'BW',
  'BV',
  'BR',
  'IO',
  'VG',
  'BN',
  'BG',
  'BF',
  'BI',
  'KH',
  'CM',
  'CA',
  'CV',
  'KY',
  'CF',
  'TD',
  'CL',
  'CN',
  'CX',
  'CC',
  'CO',
  'KM',
  'CG',
  'CK',
  'CR',
  'CI',
  'HR',
  'CU',
  'CW',
  'CY',
  'CZ',
  'CD',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'SZ',
  'ET',
  'FK',
  'FO',
  'FJ',
  'FI',
  'FR',
  'GF',
  'PF',
  'TF',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GI',
  'GR',
  'GL',
  'GD',
  'GP',
  'GU',
  'GT',
  'GG',
  'GN',
  'GW',
  'GY',
  'HT',
  'HM',
  'VA',
  'HN',
  'HK',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IM',
  'IL',
  'IT',
  'JM',
  'JP',
  'JE',
  'JO',
  'KZ',
  'KE',
  'KI',
  'XK',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MO',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MQ',
  'MR',
  'MU',
  'YT',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MS',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'AN',
  'NC',
  'NZ',
  'NI',
  'NE',
  'NG',
  'NU',
  'KP',
  'MK',
  'MP',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PN',
  'PL',
  'PT',
  'PR',
  'QA',
  'RE',
  'RO',
  'RU',
  'RW',
  'BL',
  'SH',
  'KN',
  'LC',
  'MF',
  'PM',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SX',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'KR',
  'SS',
  'ES',
  'LK',
  'SD',
  'SR',
  'SJ',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TK',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TC',
  'TV',
  'VI',
  'UG',
  'UA',
  'AE',
  'GB',
  'US',
  'UM',
  'UY',
  'UZ',
  'VU',
  'VE',
  'VN',
  'WF',
  'EH',
  'YE',
  'ZM',
  'ZW',
];

var nationalitiesAll = [
  'United Nations',
  'Afghanistan',
  'Åland Islands',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bonaire, Sint Eustatius and Saba',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bouvet Island',
  'Brazil',
  'British Indian Ocean Territory',
  'British Virgin Islands',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Cayman Islands',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Christmas Island',
  'Cocos Islands',
  'Colombia',
  'Comoros',
  'Congo',
  'Cook Islands',
  'Costa Rica',
  'Côte d’Ivoire',
  'Croatia',
  'Cuba',
  'Curaçao',
  'Cyprus',
  'Czech Republic',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Falkland Islands',
  'Faroe Islands',
  'Fiji',
  'Finland',
  'France',
  'French Guiana',
  'French Polynesia',
  'French Southern Territories',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guadeloupe',
  'Guam',
  'Guatemala',
  'Guernsey',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Heard Island and McDonald Islands',
  'Holy See (Vatican City)',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Isle of Man',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jersey',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Martinique',
  'Mauritania',
  'Mauritius',
  'Mayotte',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'Netherlands Antilles',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Niue',
  'North Korea',
  'North Macedonia',
  'Northern Mariana Islands',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Pitcairn',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Réunion',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Barthélemy',
  'Saint Helena, Ascension Island, Tristan da Cunha',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Martin',
  'Saint Pierre and Miquelon',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'São Tomé and Príncipe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Sint Maarten',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Svalbard and Jan Mayen',
  'Sweden',
  'Switzerland',
  'Syriac',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tokelau',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Türkiye',
  'Turkmenistan',
  'Turks and Caicos Islands',
  'Tuvalu',
  'U.S. Virgin Islands',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'United States Minor Outlying Islands',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Venezuela',
  'Vietnam',
  'Wallis and Futuna',
  'Western Sahara',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];
