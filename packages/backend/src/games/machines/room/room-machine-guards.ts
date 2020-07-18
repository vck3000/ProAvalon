import { RoomContext, RoomEvents } from './room-machine';
import { indexOfPlayer } from '../util';

export const isLeaderCond = (c: RoomContext, e: RoomEvents) => {
  if (e.type === 'PICK') {
    const index = indexOfPlayer(c.players, e.player.username);
    return index === c.game.leader;
  }
  return false;
};

export const minPlayers = (c: RoomContext, _: RoomEvents) =>
  c.players.length >= 5;
