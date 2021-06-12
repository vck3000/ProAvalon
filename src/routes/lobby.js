import { Router } from 'express';
const router = new Router();

router.get('/', (req, res) => {
  console.log('ip:', req.ip);

  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  console.log('alternate ip:', ip);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
  });
});

export default router;
