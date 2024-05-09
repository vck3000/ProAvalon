import express from 'express';
import {
  MultiplePatreonsForUserError,
  MultipleUsersForPatreonError,
  PatreonAgent,
  PatronDetails,
} from '../clients/patreon/patreonAgent';
import { PatreonController } from '../clients/patreon/patreonController';

const router = express.Router();
const patreonAgent = new PatreonAgent(new PatreonController());

router.get('/oauth/redirect', async (req, res) => {
  if (!req.query.code) {
    // If a user does not grant access to their Patreon account on redirect
    return res.redirect(
      // @ts-ignore
      `${req.session.postPatreonRedirectUrl}?error=We were unable to retrieve your Patreon details.`,
    );
  }

  if (
    !req.query.state ||
    // @ts-ignore
    req.query.state.toString() !== req.session.patreonAuthState
  ) {
    // @ts-ignore
    req.flash(
      'error',
      'Something went wrong. Please contact an admin if you see this.',
    );
    return res.status(403).redirect(`/`);
  }

  const code = req.query.code.toString();

  // @ts-ignore
  const postPatreonRedirectUrl = req.session.postPatreonRedirectUrl;
  // @ts-ignore
  delete req.session.patreonAuthState;
  // @ts-ignore
  delete req.session.postPatreonRedirectUrl;
  // @ts-ignore
  await req.session.save();

  let patronDetails: PatronDetails;

  try {
    patronDetails = await patreonAgent.linkUserToPatreon(
      // @ts-ignore
      req.user.username.toLowerCase(),
      code,
    );
  } catch (e) {
    if (e instanceof MultipleUsersForPatreonError) {
      return res.redirect(
        // @ts-ignore
        `${postPatreonRedirectUrl}?error=This Patreon account is already linked to another user.`,
      );
    }

    if (e instanceof MultiplePatreonsForUserError) {
      return res.redirect(
        // @ts-ignore
        `${postPatreonRedirectUrl}?error=You already have a linked Patreon account.`,
      );
    }

    throw e;
  }

  if (patronDetails.isPledgeActive) {
    return res.redirect(
      `${postPatreonRedirectUrl}?success=Your Patreon account has been linked successfully!`,
    );
  } else {
    return res.redirect(
      `${postPatreonRedirectUrl}?error=You are not a paid member on Patreon.`,
    );
  }
});

router.get('/link', async (req, res) => {
  const patreonLoginUrl = new URL(patreonAgent.getLoginUrl());
  const redirectUrl = new URL(req.query.currentUrl as string);

  // @ts-ignore
  req.session.patreonAuthState = patreonLoginUrl.searchParams.get('state');
  // @ts-ignore
  req.session.postPatreonRedirectUrl =
    redirectUrl.origin + redirectUrl.pathname;
  // @ts-ignore
  await req.session.save();

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
