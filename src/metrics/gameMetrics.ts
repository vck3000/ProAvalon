import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';

export const gamesPlayedMetric = new PromMetricCounter({
  name: 'games_played_total',
  help: 'test',
  labelNames: ['status'],
});
