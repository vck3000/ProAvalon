import { PromMetricCounter } from '../clients/victoriaMetrics/promMetricCounter';
import Game from '../gameplay/game';
import { RoomCreationType } from '../gameplay/roomTypes';

enum GameRoomType {
  MATCHMAKING = 'matchmaking',
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const gamesPlayedMetric = new PromMetricCounter({
  name: 'games_played_total',
  help: 'Total number of games played.',
  labelOptions: {
    status: new Set(['finished', 'voided']),
    room_type: new Set(Object.values(GameRoomType)),
  },
});

export function getGameMetricRoomType(game: Game) {
  if (game.roomCreationType == RoomCreationType.QUEUE) {
    return GameRoomType.MATCHMAKING;
  } else if (game.joinPassword) {
    return GameRoomType.PRIVATE;
  } else return GameRoomType.PUBLIC;
}
