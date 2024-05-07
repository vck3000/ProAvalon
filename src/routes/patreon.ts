import express from 'express';
import { patreonAgent } from '../clients/patreon/patreonAgent';

const router = express.Router();

router.get('/oauth/redirect', async (req, res) => {
  console.log('Start: Link to Patreon...');
  const { code, state } = req.query;

  // TODO-kev: Consider what happens if someone clicks deny. Rework error msg
  if (!code) {
    return res.redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}?error=You have denied access`,
    );
  }

  // @ts-ignore
  if (state !== req.session.patreonAuthState) {
    // TODO-kev: Figure a way to handle this. Redirect? Swal?
    return res.status(400).redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}`,
    );
  }

  try {
    const patreonDetails = await patreonAgent.linkUserToPatreon(
      // @ts-ignore
      req.user.username.toLowerCase(),
      code as string,
    );

    if (patreonDetails.isActivePatreon) {
      const msg = 'Your Patreon has now been linked successfully!';
      return res.redirect(
        // @ts-ignore
        `${req.session.postPatreonRedirectUrl}?success=${msg}`,
      );
    } else {
      const msg = 'You are not a paid member of our Patreon.';
      return res.redirect(
        // @ts-ignore
        `${req.session.postPatreonRedirectUrl}?error=${msg}`,
      );
    }
  } catch (e) {
    return res.redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}?error=${e}`,
    );
  } finally {
    // TODO-kev: Move these into the try catch block
    // @ts-ignore
    delete req.session.patreonAuthState;
    // @ts-ignore
    delete req.session.postPatreonRedirectUrl;

    console.log('End: Link done...');
  }
});

router.post('/unlink', async (req, res) => {
  try {
    // @ts-ignore
    const result = await patreonAgent.unlinkPatreon(req.user.usernameLower);

    if (result) {
      return res.status(200).send('Successfully unlinked Patreon account');
    } else {
      return res.status(400).send('Could not find Patreon account to unlink.');
    }
  } catch (e) {
    // TODO-kev: Does this go to the err.log file?
    console.error(e);
    return res
      .status(500)
      .send('Something went wrong. Please contact an admin if you see this.');
  }
});

export default router;
