import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';

export const gamesPlayedMetric = new PromMetricCounter({
  name: 'games_played_total',
  help: 'Total number of games played.',
  labelOptions: {
    status: ['finished', 'voided'],
  },
});
