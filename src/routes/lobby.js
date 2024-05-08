import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import Report from '../views/components/report';
import ReadyPrompt from '../views/components/readyPrompt';
import Matchmaking from '../views/components/matchmaking';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);
  const readyPromptReact = renderToString(<ReadyPrompt />);
  const matchmakingReact = renderToString(<Matchmaking />);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    readyPromptReact,
    matchmakingReact,
  });
});

export default router;
