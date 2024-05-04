import { RequestHandler } from 'express';

const VPN_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours
const VPN_LIMITER_VPNAPI = 500;
const VPN_LIMITER_GETIP = 1000;
const VPN_LIMITER_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

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

const isVPN = async (ip: string, totalDailyCalls: number): Promise<boolean> => {
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

  // Must pass both vpn checks
  let VpnCheck1;
  let VpnCheck2;

  if (totalDailyCalls < VPN_LIMITER_VPNAPI) {
    VpnCheck1 = await isVpnCheck1(ip);
  }

  if (totalDailyCalls < VPN_LIMITER_GETIP) {
    VpnCheck2 = await isVpnCheck2(ip);
  }

  const msg = 'Max daily calls reached';

  console.log(
    `VPN Detection Result: vpnapi.io="${
      VpnCheck1 ? VpnCheck1 : msg
    }" check.getipintel.net="${VpnCheck2 ? VpnCheck2 : msg}"`,
  );

  const result = VpnCheck1 || VpnCheck2;

  vpnCache.get(ip).setIsVpn(result);

  return result;
};

const isVpnCheck1 = async (ip: string): Promise<boolean> => {
  const vpnResponse = await fetch(
    `https://vpnapi.io/api/${ip}?key=${process.env.VPN_DETECTION_TOKEN}`,
  );

  const data = await vpnResponse.json();

  if (!data.security) {
    console.log(data);
    throw new Error(
      'VPN Detection lookup response did not contain the expected data at vpnapi.io.',
    );
  }

  return data.security.vpn;
};

const isVpnCheck2 = async (ip: string): Promise<boolean> => {
  const vpnResponse = await fetch(
    `https://check.getipintel.net/check.php?ip=${ip}&contact=${process.env.PROAVALON_EMAIL_ADDRESS}&flags=m`,
  );

  const data = await vpnResponse.json();
  const result: boolean = data >= 0.99 && data <= 1;

  if (data < 0 || data > 1) {
    console.log(data);
    throw new Error(
      'VPN Detection lookup response did not contain the expected data at check.getipintel.net.',
    );
  }

  return result;
};

let disallowVPNsCallCount = 0;

// Reset disallowVPNsCallCount every 24 hours
setInterval(() => {
  disallowVPNsCallCount = 0;
}, VPN_LIMITER_RESET_INTERVAL);

export const disallowVPNs: RequestHandler = (req, res, next) => {
  if (process.env.ENV === 'local') {
    next();
    return;
  }

  if (whitelistedUsernames.indexOf(req.body.username.toLowerCase()) !== -1) {
    next();
    return;
  }

  disallowVPNsCallCount++;

  isVPN(req.ip, disallowVPNsCallCount)
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
