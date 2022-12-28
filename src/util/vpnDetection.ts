import { RequestHandler } from 'express';

let whitelistedUsernames: string[] = [];
if (process.env.WHITELISTED_VPN_USERNAMES) {
  whitelistedUsernames = process.env.WHITELISTED_VPN_USERNAMES.split(',');
}

const vpnCache: Record<string, boolean> = {};

const isVPN = async (ip: string): Promise<boolean> => {
  if (vpnCache[ip]) {
    return vpnCache[ip];
  }

  console.log(`Checking VPN status of ip: ${ip}`);

  const response = await fetch(
    `https://vpnapi.io/api/${ip}?key=${process.env.VPN_DETECTION_TOKEN}`,
  );

  const data = await response.json();

  if (!data.security) {
    console.log(data);
    throw new Error(
      'VPN Detection lookup response did not contain the expected data.',
    );
  }

  const result: boolean = data.security.vpn;

  vpnCache[ip] = result;
  console.log(`VPN Cache size: ${Object.keys(vpnCache).length}`);

  return result;
};

export const disallowVPNs: RequestHandler = (req, res, next) => {
  if (process.env.ENV === 'local') {
    next();
    return;
  }

  if (whitelistedUsernames.indexOf(req.body.username.toLowerCase()) !== -1) {
    next();
    return;
  }

  isVPN(req.ip)
    .then((vpn) => {
      if (vpn) {
        console.log(`Blocked ${req.body.username} on ip ${req.ip}`);

        // @ts-ignore
        req.flash('error', 'VPNs are not allowed.');
        res.redirect('/');
        return;
      }

      next();
    })
    .catch((err) => {
      next();
      throw err;
    });
};
