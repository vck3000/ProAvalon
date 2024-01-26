import { RequestHandler } from 'express';

const VPN_TIMEOUT = 1000 * 60 * 60 * 12; // 12 hours

let whitelistedUsernames: string[] = [];
if (process.env.WHITELISTED_VPN_USERNAMES) {
  whitelistedUsernames = process.env.WHITELISTED_VPN_USERNAMES.split(',');
}

class VpnEntry {
  // Default it to True in case it fails.
  private isVpn = true;
  private isSet = false;
  private timeCreated: Date;

  constructor(timeCreated: Date) {
    this.timeCreated = timeCreated;
  }

  isTimedOut(newTime: Date): boolean {
    // + on a date object implicitly casts it to a number
    const timeDiffMillis = +newTime - +this.timeCreated;

    return timeDiffMillis > VPN_TIMEOUT;
  }

  getIsVpn(): boolean {
    return this.isVpn;
  }

  setIsVpn(isVpn: boolean): void {
    if (this.isSet) {
      throw new Error(
        'VpnEntry has already been set. Should not never be set again.',
      );
    }

    this.isVpn = isVpn;
    this.isSet = true;
  }
}

type IP = string;

const vpnCache: Map<IP, VpnEntry> = new Map();

const isVPN = async (ip: string): Promise<boolean> => {
  // Temporarily disable VPN checking
  return false;

  if (vpnCache.has(ip)) {
    // Clear the cache entry if it's timed out.
    if (vpnCache.get(ip).isTimedOut(new Date())) {
      vpnCache.delete(ip);
    }
    // Otherwise we have a valid entry. Directly return.
    else {
      return vpnCache.get(ip).getIsVpn();
    }
  }

  vpnCache.set(ip, new VpnEntry(new Date()));
  console.log(`Checking VPN status of ip: ${ip}`);
  console.log(`VPN Cache size: ${vpnCache.size}`);

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

  vpnCache.get(ip).setIsVpn(result);

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
      throw err;
    });
};
