import { RequestHandler } from 'express';

export const isVPN = async (ip: string): Promise<boolean> => {
  const response = await fetch(
    `https://whois.as207111.net/api/lookup?ip_address=${ip}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.VPN_DETECTION_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (!data.privacy) {
    console.log(ip);
    console.log(data);
    throw new Error(
      'VPN Detection lookup response did not contain the expected data.'
    );
  }

  return data.privacy.proxy || data.privacy.hosting;
};

export const disallowVPNs: RequestHandler = (req, res, next) => {
  if (process.env.MY_PLATFORM === 'local') {
    next();
    return;
  }

  const clientIpAddress = (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress) as string;

  isVPN(clientIpAddress)
    .then((vpn) => {
      if (vpn) {
        console.log(`Blocked ${req.body.username} on ip ${clientIpAddress}`);

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
