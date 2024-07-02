import { PromMetricGauge } from '../clients/victoriaMetrics/promMetricGauge';
import { allSockets } from '../sockets/sockets';
import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';

const onlinePlayersMetric = new PromMetricGauge({
  name: `online_players_total`,
  help: `Number of online players.`,
  collect() {
    this.set(allSockets.length);
  },
});

export const avatarSubmissionsMetric = new PromMetricCounter({
  name: `custom_avatar_submissions_total`,
  help: `Total number of custom avatar submissions.`,
});

export const passwordResetEmailMetric = new PromMetricCounter({
  name: `password_reset_emails_total`,
  help: `Total number of password reset emails sent out.`,
});

export const passwordResetMetric = new PromMetricCounter({
  name: `password_resets_total`,
  help: `Total number of password resets completed.`,
});
