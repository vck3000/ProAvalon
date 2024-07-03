import { allSockets } from '../sockets/sockets';
import { PromMetricGauge } from '../clients/victoriaMetrics/promMetricGauge';
import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';

const onlinePlayersMetric = new PromMetricGauge({
  name: `online_players_total`,
  help: `Number of online players.`,
  collect() {
    this.set(allSockets.length);
  },
});

export const uniqueLoginsMetric = new PromMetricCounter({
  name: 'unique_logins_total',
  help: 'Total number of unique logins over a 24h time period.',
});

export const avatarSubmissionsMetric = new PromMetricCounter({
  name: `custom_avatar_submissions_total`,
  help: `Total number of custom avatar submissions.`,
});

export const passwordResetRequestsMetric = new PromMetricCounter({
  name: `password_reset_requests_total`,
  help: `Total number of password reset emails sent out.`,
});

export const passwordResetCompletedMetric = new PromMetricCounter({
  name: `password_resets_completed_total`,
  help: `Total number of password resets completed.`,
});
