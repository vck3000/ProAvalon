import { PromMetricGauge } from '../clients/victoriaMetrics/promMetricGauge';
import { allSockets } from '../sockets/sockets';

const onlinePlayersMetric = new PromMetricGauge({
  name: `online_players_total`,
  help: `Number of online players.`,
  collect() {
    this.set(allSockets.length);
  },
});
