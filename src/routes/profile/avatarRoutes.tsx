import React from 'react';
import express, { Response } from 'express';
import { renderToString } from 'react-dom/server';

import User from '../../models/user';
import AvatarHome from '../../views/components/avatar/avatarHome';
import { EnrichedRequest } from '../types';
import { checkProfileOwnership } from '../middleware';

import { userAdapter } from '../../databaseAdapters';
import { S3AvatarSet, S3Agent } from '../../clients/s3/S3Agent';
import S3Controller from '../../clients/s3/S3Controller';

import { getAndUpdatePatreonRewardTierForUser } from '../../rewards/getRewards';

export type AllAvatarsRouteReturnType = {
  currentResLink: string;
  currentSpyLink: string;
  avatarLibrary: S3AvatarSet[];
};

const router = express.Router();
const s3Agent = new S3Agent(new S3Controller());

// Show the user's avatar homepage
router.get(
  '/:profileUsername/avatar',
  checkProfileOwnership,
  (req: EnrichedRequest, res: Response) => {
    const avatarHomeReact = renderToString(<AvatarHome />);
    res.render('profile/avatarhome', { avatarHomeReact });
  },
);

// For a user to change their own current avatar
router.post(
  '/:profileUsername/avatar/changeavatar',
  checkProfileOwnership,
  async (req: EnrichedRequest, res: Response) => {
    if (!req.body.avatarSetId || !req.body.resLink || !req.body.spyLink) {
      return res.status(400).send('Bad input.');
    }

    const user = await User.findOne({
      usernameLower: req.user.usernameLower,
    });

    if (!user.avatarLibrary.includes(req.body.avatarSetId)) {
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

// Reset user's avatar to default
router.post(
  '/:profileUsername/avatar/resetavatar',
  checkProfileOwnership,
  async (req: EnrichedRequest, res: Response) => {
    if (!req.user.avatarImgRes && !req.user.avatarImgSpy) {
      return res.status(400).send('You are already using the default avatar.');
    }

    await userAdapter.resetAvatar(req.user.username);

    return res.status(200).send('Avatar reset successful.');
  },
);

// Get a user's avatar library links
router.get(
  '/:profileUsername/avatar/getalluseravatars',
  checkProfileOwnership,
  async (req: EnrichedRequest, res: Response) => {
    await getAndUpdatePatreonRewardTierForUser(req.user.usernameLower);

    const user = await userAdapter.getUser(req.user.usernameLower);

    const result: AllAvatarsRouteReturnType = {
      currentResLink: user.avatarImgRes,
      currentSpyLink: user.avatarImgSpy,
      avatarLibrary: user.avatarLibrary
        ? s3Agent.getAvatarSetsFromIds(user.usernameLower, user.avatarLibrary)
        : null,
    };

    res.status(200).send(result);
  },
);

export default router;
