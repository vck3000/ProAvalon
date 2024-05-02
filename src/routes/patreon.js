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

  if (!patreonDetails.isActivePatreon) {
    req.flash('error', 'You are not a paid member of our Patreon.');
  } else {
    req.flash('success', 'Your Patreon has now been linked successfully!');
  }

  return res.redirect(`/profile/${req.user.username}`);
});

export default router;
