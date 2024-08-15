import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';
import Game from '../gameplay/game';
import { RoomCreationType } from '../gameplay/roomTypes';

enum GameMetricRoomType {
  MATCHMAKING = 'matchmaking',
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const gamesPlayedMetric = new PromMetricCounter({
  name: 'games_played_total',
  help: 'Total number of games played.',
  labelOptions: {
    status: new Set(['finished', 'voided']),
    room_type: new Set(Object.values(GameMetricRoomType)),
  },
});

export function getGameMetricRoomType(game: Game): GameMetricRoomType {
  if (game.roomCreationType == RoomCreationType.QUEUE) {
    return GameMetricRoomType.MATCHMAKING;
  } else if (game.joinPassword) {
    return GameMetricRoomType.PRIVATE;
  } else return GameMetricRoomType.PUBLIC;
}
