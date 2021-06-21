import { Router } from 'express';
const router = new Router();

router.get('/', (req, res) => {
  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
  });
});

export default router;
