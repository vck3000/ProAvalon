import express from 'express';
import {
  patreonAgent,
  PatronPublicDetails,
} from '../clients/patreon/patreonAgent';

const router = express.Router();

router.get('/oauth/redirect', async (req, res) => {
  const code = req.query.code.toString();
  const state = req.query.state.toString();

  // TODO-kev: Consider what happens if someone clicks deny. Rework error msg
  if (!code) {
    return res.redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}?error=You have denied access`,
    );
  }

  // @ts-ignore
  if (state !== req.session.patreonAuthState) {
    // TODO-kev: Figure a way to handle this. Redirect to homepage? Swal? Should not be based on redirectUrl
    console.error('CSRF detected.');
    return res.status(403).redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}`,
    );
  }

  // @ts-ignore
  const postPatreonRedirectUrl = req.session.postPatreonRedirectUrl;
  // @ts-ignore
  delete req.session.patreonAuthState;
  // @ts-ignore
  delete req.session.postPatreonRedirectUrl;

  let patronDetails: PatronPublicDetails;

  try {
    patronDetails = await patreonAgent.linkUserToPatreon(
      // @ts-ignore
      req.user.username.toLowerCase(),
      code,
    );
  } catch (e) {
    if (e.name === 'MultipleUsersForPatreonError') {
      return res.redirect(
        // @ts-ignore
        `${postPatreonRedirectUrl}?error=This Patreon account is already linked to another user.`,
      );
    }

    if (e.name === 'MultiplePatreonsForUserError') {
      return res.redirect(
        // @ts-ignore
        `${postPatreonRedirectUrl}?error=You already have a linked Patreon account.`,
      );
    }

    throw e;
  }

  if (patronDetails.isActivePatron) {
    const msg = 'Your Patreon account has been linked successfully!';
    return res.redirect(
      // @ts-ignore
      `${postPatreonRedirectUrl}?success=${msg}`,
    );
  } else {
    const msg = 'You are not a paid member on Patreon.';
    return res.redirect(
      // @ts-ignore
      `${postPatreonRedirectUrl}?error=${msg}`,
    );
  }
});

router.get('/link', async (req, res) => {
  const patreonLoginUrl = patreonAgent.getPatreonAuthorizationUrl();
  const patreonLoginUrlParams = new URLSearchParams(
    patreonLoginUrl.split('?')[1],
  );

  // @ts-ignore
  req.session.patreonAuthState = patreonLoginUrlParams.get('state');
  // @ts-ignore
  req.session.postPatreonRedirectUrl = req.query.postPatreonRedirectUrl;

  res.send(patreonLoginUrl);
});

router.post('/unlink', async (req, res) => {
  const unlinkSuccess = await patreonAgent.unlinkPatreon(
    // @ts-ignore
    req.user.usernameLower,
  );

  if (unlinkSuccess) {
    return res.status(200).send('Successfully unlinked Patreon account');
  } else {
    return res.status(400).send('Could not find Patreon account to unlink.');
  }
});

export default router;
