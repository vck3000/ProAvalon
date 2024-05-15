import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import Report from '../views/components/report';
import ReadyPrompt from '../views/components/readyPrompt';
import Matchmaking from '../views/components/matchmakingUi';

const router = new Router();

router.get('/', async (req, res) => {
  const reportsReact = renderToString(<Report />);
  const readyPromptReact = renderToString(<ReadyPrompt />);
  const matchmakingReact = renderToString(<Matchmaking />);
  const patreonExpired = req.user.expiredPatreonNotification;

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    readyPromptReact,
    matchmakingReact,
    patreonExpired,
  });

  req.user.expiredPatreonNotification = false;
  await req.user.save();
});

export default router;
