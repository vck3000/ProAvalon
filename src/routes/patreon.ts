import express from 'express';
import { patreonAgent } from '../clients/patreon/patreonAgent';

const router = express.Router();

router.get('/oauth/redirect', async (req, res) => {
  // TODO-kev: Consider what happens if someone clicks deny

  console.log('Start: Link to Patreon...');
  const { code, state } = req.query;

  // @ts-ignore
  console.log(`Matching state = ${req.session.patreonAuthState}`);
  // @ts-ignore
  console.log(`Original url = ${req.session.patreonOriginalUrl}`);

  // @ts-ignore
  if (state !== req.session.patreonAuthState) {
    // TODO-kev: Figure a way to handle this. Redirect? Swal?
    throw new Error('State parameter mismatch');
  }

  // @ts-ignore
  // TODO-kev: Look into what happens if not deleted
  delete req.session.patreonAuthState;
  // @ts-ignore
  delete req.session.patreonOriginalUrl;

  const patreonDetails = await patreonAgent.linkUserToPatreon(
    // @ts-ignore
    req.user.username.toLowerCase(),
    code as string,
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
