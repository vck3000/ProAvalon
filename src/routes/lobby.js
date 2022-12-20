import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import Report from '../views/components/report';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
  });
});

export default router;
