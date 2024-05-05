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
      `${req.session.patreonOriginalUrl}?error=You have denied access`,
    );
  }

  // @ts-ignore
  if (state !== req.session.patreonAuthState) {
    // TODO-kev: Figure a way to handle this. Redirect? Swal?
    return res.status(400).redirect(
      // @ts-ignore
      `${req.session.patreonOriginalUrl}`,
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
        `${req.session.patreonOriginalUrl}?success=${msg}`,
      );
    } else {
      const msg = 'You are not a paid member of our Patreon.';
      return res.redirect(
        // @ts-ignore
        `${req.session.patreonOriginalUrl}?error=${msg}`,
      );
    }
  } catch (e) {
    return res.redirect(
      // @ts-ignore
      `${req.session.patreonOriginalUrl}?error=${e}`,
    );
  } finally {
    // @ts-ignore
    delete req.session.patreonAuthState;
    // @ts-ignore
    delete req.session.patreonOriginalUrl;

    console.log('End: Link done...');
  }
});

export default router;
