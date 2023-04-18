import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import MatchMakingModal from '../views/components/queue/index';

import Report from '../views/components/report';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);
  const onQueueReact = renderToString(<MatchMakingModal />);
  console.log(onQueueReact);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    onQueueReact,
  });
});

export default router;
