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
  help: `Total number of custom avatar submissions`,
});
