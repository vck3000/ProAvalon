import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';

export const gamesPlayedMetric = new PromMetricCounter({
  name: 'games_played_total',
  help: 'Total number of games played.',
  labelOptions: {
    status: new Set(['finished', 'voided']),
    room_creation_type: new Set(['matchmaking', 'public', 'private']),
  },
});
