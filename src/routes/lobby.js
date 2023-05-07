import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { inQueue } from '../views/components/queue/index'
import { Timer } from '../views/components/timer/index'

import Report from '../views/components/report';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);
  const onQueueReact = renderToString(<inQueue />);
  const timerReact = renderToString(<Timer />);
  console.log(onQueueReact);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    onQueueReact,
    timerReact,
  });
});

export default router;
