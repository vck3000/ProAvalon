import express from 'express';
import { patreonAgent } from '../clients/patreon/patreonAgent';

const router = express.Router();

router.get('/oauth/redirect', async (req, res) => {
  console.log('Start: Link to Patreon...');
  const { code } = req.query;

  const patreonDetails = await patreonAgent.linkUserToPatreon(
    // @ts-ignore
    req.user.username.toLowerCase(),
    code as string,
  );

  console.log(
    `Overall result: active=${patreonDetails.isActivePatreon} amountCents=${patreonDetails.amountCents}`,
  );
  console.log('End: Link done...');

  if (!patreonDetails.isActivePatreon) {
    // @ts-ignore
    req.flash('error', 'You are not a paid member of our Patreon.');
  } else {
    // @ts-ignore
    req.flash('success', 'Your Patreon has now been linked successfully!');
  }

  // @ts-ignore
  return res.redirect(`/profile/${req.user.username}/edit`);
});

export default router;
