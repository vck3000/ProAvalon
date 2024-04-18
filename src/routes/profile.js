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

const MAX_ACTIVE_AVATAR_REQUESTS = 2;
const MIN_GAMES_REQUIRED = 100;
const VALID_DIMENSIONS = [128, 1024];
const MAX_FILESIZE = 1048576; // 1MB

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
      });
    }
  });
});

// moderator approve or reject custom avatar requests
router.post('/mod/ajax/processavatarrequest', isModMiddleware, (req, res) => {
  const s3 = req.s3;

  avatarRequest.findById(req.body.avatarreqid).exec(async (err, foundReq) => {
    if (err) {
      console.log(err);
    } else if (foundReq) {
      foundReq.processed = true;
      foundReq.modComment = req.body.modcomment;
      foundReq.approved = req.body.decision;
      foundReq.modWhoProcessed = req.user.username;

      if (req.body.decision === true || req.body.decision === 'true') {
        const updateLink = async (link) => {
          const index = link.indexOf('pending_avatars');
          const endpoint = link.substring(0, index);
          const key = link.substring(index);

          const updatedKey = await s3.approveAvatarRefactorFilePath(key);

          return `${endpoint}${updatedKey}`;
        };

        foundReq.resLink = await updateLink(foundReq.resLink);
        foundReq.spyLink = await updateLink(foundReq.spyLink);

        foundReq.markModified('resLink');
        foundReq.markModified('spyLink');

        await foundReq.save();

        User.findOne({ usernameLower: foundReq.forUsername.toLowerCase() })
          .populate('notifications')
          .exec((err, foundUser) => {
            if (err) {
              console.log(err);
            } else {
              foundUser.avatarImgRes = foundReq.resLink;
              foundUser.avatarImgSpy = foundReq.spyLink;

              foundUser.save();

              let str = `Your avatar request was approved by ${foundReq.modWhoProcessed}!`;
              if (foundReq.modComment) {
                str += ` Their comment was: ${foundReq.modComment}`;
              }

              createNotification(foundUser._id, str, '#', req.user.username);
            }
          });
      } else if (req.body.decision === false || req.body.decision === 'false') {
        const pattern = /pending_avatars\/.*$/;

        if (
          !foundReq.resLink.match(pattern) ||
          !foundReq.resLink.match(pattern)
        ) {
          throw new Error(
            `Invalid link provided: resLink: ${foundReq.resLink} spyLink: ${foundReq.spyLink}`,
          );
        }

        await s3.rejectAvatarRequest(foundReq.resLink.match(pattern)[0]);
        await s3.rejectAvatarRequest(foundReq.spyLink.match(pattern)[0]);

        User.findOne({ usernameLower: foundReq.forUsername.toLowerCase() })
          .populate('notifications')
          .exec((err, foundUser) => {
            if (err) {
              console.log(err);
            } else {
              let str = `Your avatar request was rejected by ${foundReq.modWhoProcessed}.`;

              if (foundReq.modComment) {
                str += ` Their comment was: ${foundReq.modComment}`;
              }

              console.log(`string: ${str}`);

              createNotification(foundUser._id, str, '#', req.user.username);
            }
          });
      } else {
        console.log(
          `error, decision isnt anything recognisable...: ${req.body.decision}`,
        );
        return;
      }

      const modUser = req.user;
      // Create mod log - Doesn't need to be async
      ModLog.create({
        type: 'avatar',
        modWhoMade: {
          id: modUser._id,
          username: modUser.username,
          usernameLower: modUser.usernameLower,
        },
        data: {
          modComment: req.body.modcomment,
          approved: req.body.decision,
          username: foundReq.forUsername,
          msgToMod: foundReq.msgToMod,
          resLink: foundReq.resLink,
          spyLink: foundReq.spyLink,
        },
        dateCreated: new Date(),
      });

      await foundReq.save();

      if (req.body.decision === false || req.body.decision === 'false') {
        await foundReq.remove();
      }
    }
  });

  res.status(200).send('done');
});

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
          res.render('profile/changeavatar', { userData: foundUser });
        }
      },
    );
  },
);

const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: MAX_FILESIZE },
// }).fields([
//   { name: 'avatarRes', maxCount: 1 },
//   { name: 'avatarSpy', maxCount: 1 }, // Whitelist, other files will not be accepted
// ]);

const upload = function (req, res, next) {
  multer({
    storage: storage,
    limits: { fileSize: MAX_FILESIZE },
  }).fields([
    { name: 'avatarRes', maxCount: 1 },
    { name: 'avatarSpy', maxCount: 1 }, // Whitelist, other files will not be accepted
  ])(req, res, function (err) {
    // TODO-kev: Check below if it is handling it correctly
    if (err instanceof multer.MulterError && err.message === 'File too large') {
      // TODO-kev: Function for 1MB? Enum object?
      req.flash('error', 'File size exceeds the limit: 1MB.');
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    } else if (err) {
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
    if (req.fileSizeLimitExceeded) {
      req.flash('error', 'File size exceeds the limit.');
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    const s3 = req.s3;
    const user = await User.findOne({ username: req.params.profileUsername });

    if (!user) {
      throw new Error(`User not found: ${req.params.profileUsername}`);
    }

    // Checks if custom avatar request is valid
    if (user.totalGamesPlayed < MIN_GAMES_REQUIRED) {
      req.flash(
        'error',
        `You must play at least 100 games to submit a custom avatar request. You have played ${user.totalGamesPlayed} games.`,
      );
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    let totalAvatarRequests = await avatarRequest.aggregate([
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

    totalAvatarRequests =
      totalAvatarRequests.length === 0 ? 0 : totalAvatarRequests[0].total;

    if (totalAvatarRequests >= MAX_ACTIVE_AVATAR_REQUESTS) {
      req.flash(
        'error',
        `You cannot submit more than ${MAX_ACTIVE_AVATAR_REQUESTS} custom avatar requests.`,
      );
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    // TODO: should i check existence of req.files['avatarRes'][0] as well?
    if (!req.files['avatarRes'] || !req.files['avatarSpy']) {
      req.flash('error', 'You must submit a Res and Spy avatar.');
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    const avatarRes = req.files['avatarRes'][0];
    const avatarSpy = req.files['avatarSpy'][0];

    if (
      avatarRes.mimetype !== 'image/png' ||
      avatarSpy.mimetype !== 'image/png'
    ) {
      req.flash('error', 'You may only submit png files.');
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    const dimRes = imageSize(avatarRes.buffer);
    const dimSpy = imageSize(avatarSpy.buffer);

    if (
      !VALID_DIMENSIONS.includes(dimRes.width) ||
      !VALID_DIMENSIONS.includes(dimRes.height) ||
      !VALID_DIMENSIONS.includes(dimSpy.width) ||
      !VALID_DIMENSIONS.includes(dimSpy.height)
    ) {
      let validDimStr = '';

      VALID_DIMENSIONS.forEach((dimension, index) => {
        validDimStr += `${dimension}x${dimension}px`;
        if (index !== VALID_DIMENSIONS.length - 1) {
          validDimStr += ' or ';
        }
      });

      req.flash(
        'error',
        `Avatar dimensions must be ${validDimStr}. Your dimensions are: Res: ${dimRes.width}x${dimRes.height}px, Spy: ${dimSpy.width}x${dimSpy.height}px.`,
      );
      return res.redirect(
        `/profile/${req.params.profileUsername}/changeavatar`,
      );
    }

    const msgToMod = req.body.msgToMod
      ? sanitizeHtml(req.body.msgToMod)
      : 'No message provided.';

    // Upload valid avatar requests to s3 bucket
    const avatarLinks = await s3.uploadAvatarRequest(
      req.params.profileUsername,
      avatarRes.buffer,
      avatarSpy.buffer,
    );

    const avatarRequestData = {
      forUsername: req.params.profileUsername.toLowerCase(),
      resLink: avatarLinks[0],
      spyLink: avatarLinks[1],
      msgToMod: msgToMod,
      dateRequested: new Date(),
      processed: false,
    };

    avatarRequest.create(avatarRequestData, (err, createdRequest) => {
      if (err) {
        console.log(err);
      } else {
        req.flash(
          'success',
          'Your submission was received! Please wait for a moderator to process your request.',
        );
        res.redirect(`/profile/${req.params.profileUsername}`);
      }
    });

    console.log(
      `Received change avatar request for user: ${req.params.profileUsername} msgToMod: ${msgToMod} resLink: ${avatarLinks[0]} spyLink: ${avatarLinks[1]}`,
    );
  },
);

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
