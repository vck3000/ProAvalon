import express from 'express';

const router = express.Router();
import sanitizeHtml from 'sanitize-html';
import url from 'url';
import { isModMiddleware, checkProfileOwnership } from './middleware';
import User from '../models/user';
import PatreonId from '../models/patreonId';
import avatarRequest from '../models/avatarRequest';
import ModLog from '../models/modLog';
import { createNotification } from '../myFunctions/createNotification';
import multer from 'multer';
import imageSize from 'image-size';
import { s3 } from '../s3/S3Agent';

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
        MAX_FILESIZE_STR: MAX_FILESIZE_STR,
        VALID_DIMENSIONS_STR: VALID_DIMENSIONS_STR,
      });
    }
  });
});

// moderator approve or reject custom avatar requests
router.post(
  '/mod/ajax/processavatarrequest',
  isModMiddleware,
  async (req, res) => {
    const avatarReq = await avatarRequest.findById(req.body.avatarreqid);
    const userRequestingAvatar = await User.findOne({
      usernameLower: avatarReq.forUsername.toLowerCase(),
    });

    const modWhoProcessed = req.user;

    if (req.body.decision === true || req.body.decision === 'true') {
      avatarReq.resLink = await s3.approveAvatarRefactorFilePath(
        avatarReq.resLink,
      );
      avatarReq.spyLink = await s3.approveAvatarRefactorFilePath(
        avatarReq.spyLink,
      );
      avatarReq.markModified('resLink');
      avatarReq.markModified('spyLink');

      await avatarReq.save();

      userRequestingAvatar.avatarImgRes = avatarReq.resLink;
      userRequestingAvatar.avatarImgSpy = avatarReq.spyLink;
      userRequestingAvatar.markModified('avatarImgRes');
      userRequestingAvatar.markModified('avatarImgSpy');

      await userRequestingAvatar.save();

      // TODO-kev: Fundamental flaw in createNotification. Passing non unique link #
      let str = `Your avatar request was approved by ${avatarReq.modWhoProcessed.username}! Their comment was: ${avatarReq.modComment}`;
      createNotification(
        userRequestingAvatar._id,
        str,
        '#',
        modWhoProcessed.username,
      );
    } else if (req.body.decision === false || req.body.decision === 'false') {
      await s3.rejectAvatarRequest(avatarReq.resLink);
      await s3.rejectAvatarRequest(avatarReq.spyLink);

      avatarReq.resLink = null;
      avatarReq.spyLink = null;
      avatarReq.markModified('resLink');
      avatarReq.markModified('spyLink');

      let str = `Your avatar request was rejected by ${avatarReq.modWhoProcessed.username}. Their comment was: ${avatarReq.modComment}`;
      createNotification(
        userRequestingAvatar._id,
        str,
        '#',
        modWhoProcessed.username,
      );
    } else {
      // TODO-kev: Change the error?
      console.log(
        `error, decision isnt anything recognisable...: ${req.body.decision}`,
      );
      return;
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
        modComment: req.body.modcomment,
        approved: req.body.decision,
        username: avatarReq.forUsername,
        msgToMod: avatarReq.msgToMod,
        resLink: avatarReq.resLink,
        spyLink: avatarReq.spyLink,
      },
      dateCreated: new Date(),
    });

    if (req.body.decision === false || req.body.decision === 'false') {
      await avatarReq.remove();
    } else {
      avatarReq.processed = true;
      avatarReq.modComment = req.body.modcomment;
      avatarReq.approved = req.body.decision;
      avatarReq.modWhoProcessed = modWhoProcessed.username;
      avatarReq.markModified('processed');
      avatarReq.markModified('modComment');
      avatarReq.markModified('approved');
      avatarReq.markModified('modWhoProcessed');

      await avatarReq.save();
    }

    res.status(200).send('done');
  },
);

// Show the customavatar edit page
router.get(
  '/:profileUsername/changeavatar',
  checkProfileOwnership,
  (req, res) => {
    User.findOne(
      { usernameLower: req.params.profileUsername.toLowerCase() },
      (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          res.render('profile/changeavatar', {
            userData: foundUser,
            MAX_FILESIZE_STR: MAX_FILESIZE_STR,
            VALID_DIMENSIONS: VALID_DIMENSIONS,
            VALID_DIMENSIONS_STR: VALID_DIMENSIONS_STR,
          });
        }
      },
    );
  },
);

const storage = multer.memoryStorage();
const upload = function (req, res, next) {
  multer({
    storage: storage,
    limits: { fileSize: MAX_FILESIZE },
  }).fields([
    // This is a whitelist, other files will not be accepted
    { name: 'avatarRes', maxCount: 1 },
    { name: 'avatarSpy', maxCount: 1 },
  ])(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.message === 'File too large') {
        res
          .status(400)
          .send(`File size exceeds the limit: ${MAX_FILESIZE_STR}.`);
        return;
      } else {
        res.status(400).send(`Error: ${err.message}.`);
        return;
      }
    } else if (err) {
      // TODO-kev: Check below if it is handling it correctly
      console.log(err);
    }
    next();
  });
};

// Update the customavatar
router.post(
  '/:profileUsername/changeavatar',
  checkProfileOwnership,
  upload,
  async (req, res) => {
    const result = await validateUploadAvatarRequest(
      req.params.profileUsername,
      req.files,
    );

    if (!result.valid) {
      res.status(400).send(result.errMsg);
      return;
    }

    const msgToMod = req.body.msgToMod
      ? sanitizeHtml(req.body.msgToMod)
      : 'No message provided.';

    // Upload valid avatar requests to s3 bucket
    const avatarRes = req.files['avatarRes'][0];
    const avatarSpy = req.files['avatarSpy'][0];

    const avatarLinks = await s3.uploadAvatarRequestImages(
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

async function validateUploadAvatarRequest(username, files) {
  const user = await User.findOne({ username: username });

  if (!user) {
    throw new Error(`User not found: ${username}`);
  }

  // Check: Min game count satisfied
  if (user.totalGamesPlayed < MIN_GAMES_REQUIRED) {
    return {
      valid: false,
      errMsg: `You must play at least 100 games to submit a custom avatar request. You have played ${user.totalGamesPlayed} games.`,
    };
  }

  // Check: Does not exceed max active avatar requests
  let totalActiveAvatarRequests = await avatarRequest.aggregate([
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

  totalActiveAvatarRequests =
    totalActiveAvatarRequests.length === 0
      ? 0
      : totalActiveAvatarRequests[0].total;

  if (totalActiveAvatarRequests >= MAX_ACTIVE_AVATAR_REQUESTS) {
    return {
      valid: false,
      errMsg: `You cannot submit more than ${MAX_ACTIVE_AVATAR_REQUESTS} active custom avatar requests.`,
    };
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
      errMsg: `You must submit both a Res and Spy avatar.`,
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
    !VALID_DIMENSIONS.includes(dimSpy.height)
  ) {
    return {
      valid: false,
      errMsg: `Avatar dimensions must be ${VALID_DIMENSIONS_STR}. Your dimensions are: Res: ${dimRes.width}x${dimRes.height}px, Spy: ${dimSpy.width}x${dimSpy.height}px.`,
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
          res.render('profile/changepassword', { userData: foundUser });
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
router.get('/:profileUsername/edit', checkProfileOwnership, (req, res) => {
  User.findOne(
    { usernameLower: req.params.profileUsername.toLowerCase() },
    (err, foundUser) => {
      if (err) {
        console.log(err);
      } else if (foundUser.patreonId) {
        PatreonId.findOne({ id: foundUser.patreonId })
          .exec()
          .then((patreonIdObj) => {
            res.render('profile/edit', {
              userData: foundUser,
              patreonLoginUrl: loginUrl,
              patreonId: patreonIdObj,
            });
          })
          .catch((err) => {
            res.render('profile/edit', {
              userData: foundUser,
              patreonLoginUrl: loginUrl,
            });
          });
      } else {
        res.render('profile/edit', {
          userData: foundUser,
          patreonLoginUrl: loginUrl,
        });
      }
    },
  );
});

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
