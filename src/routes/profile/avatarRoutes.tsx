// @ts-nocheck
import React from 'react';
import { Router } from 'express';
import { renderToString } from 'react-dom/server';

import User from '../../models/user';
import AvatarHome from '../../views/components/avatarHome';

import { S3AvatarSet, S3Agent } from '../../clients/s3/S3Agent';
import S3Controller from '../../clients/s3/S3Controller';
import { PatreonAgent } from '../../clients/patreon/patreonAgent';
import { PatreonController } from '../../clients/patreon/patreonController';

import { getAndUpdatePatreonRewardTierForUser } from '../../rewards/getRewards';
import { isMod } from '../../modsadmins/mods';

export type AllAvatarsRouteReturnType = {
  currentResLink: string;
  currentSpyLink: string;
  avatarLibrary: S3AvatarSet[];
};

const s3Agent = new S3Agent(new S3Controller());
const patreonAgent = new PatreonAgent(new PatreonController());

// TODO-kev: Consider moving this out of profile routes in general
const router = new Router();

// TODO-kev: Add something similar to checkProfileOwnership? Do i even need this?

// TODO-kev: Should i keep this here? Or move back to profile
// Show the user's avatar homepage
router.get('/', (req, res) => {
  const avatarHomeReact = renderToString(<AvatarHome />);
  res.render('profile/avatarhome', { avatarHomeReact });
});

// Change a users current avatar
router.post('/changeavatar', async (req, res) => {
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
});

// Get a users avatar library links
router.get('/getallavatars', async (req, res) => {
  // TODO-kev: Put this function here or when the avatar homepage is first rendered?
  await getAndUpdatePatreonRewardTierForUser(req.user.usernameLower);

  const user = await User.findOne({
    usernameLower: req.user.usernameLower,
  });

  const result: AllAvatarsRouteReturnType = {
    currentResLink: user.avatarImgRes,
    currentSpyLink: user.avatarImgSpy,
    avatarLibrary: await s3Agent.getUsersAvatarLibraryLinks(
      user.usernameLower,
      user.avatarLibrary as number[],
    ),
  };

  res.status(200).send(result);
});

export default router;
