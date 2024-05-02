import express from 'express';
import { PatreonAgent } from '../rewards/patreonAgent';

const router = express.Router();

router.get('/oauth/redirect', async (req, res) => {
  console.log('Start: Link to Patreon...');
  const { code } = req.query;
  const patreonAgent = new PatreonAgent();

  const patreonDetails = await patreonAgent.registerPatreon(
    req.user.username.toLowerCase(),
    code,
  );

  console.log(
    `Overall result: active=${patreonDetails.isActivePatreon} amountCents=${patreonDetails.amountCents}`,
  );
  console.log('End: Link done...');

  return res.redirect(`/profile/${req.user.username}`);
});

export default router;
