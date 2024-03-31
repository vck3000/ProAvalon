import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import Report from '../views/components/report';
import ReadyPrompt from '../views/components/readyPrompt';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);
  const readyPromptReact = renderToString(<ReadyPrompt />);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    readyPromptReact,
    dev: process.env.ENV === 'local',
  });
});

export default router;
