import { RoomContext, RoomEvents } from './room-machine';
import { indexOfPlayer, filterPlayers } from '../util';
import { CPlayer } from '../ecs/game-components';

export const isLeaderCond = (c: RoomContext, e: RoomEvents) => {
  if (e.type === 'PICK') {
    const players = filterPlayers(c.entities);
    const index = indexOfPlayer(players, e.player.displayUsername);

    return index === c.game.leader;
  }
  return false;
};

export const minPlayers = (c: RoomContext, _: RoomEvents) => {
  const players = filterPlayers(c.entities);

  const satPlayers = players.filter(
    (player) => (player.components.player as CPlayer).satDown,
  );

  return satPlayers.length >= 5;
};
