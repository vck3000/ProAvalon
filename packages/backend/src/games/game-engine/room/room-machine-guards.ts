import { RoomContext, RoomEvents } from './room-machine';
import { indexOfPlayer, filterByComponent } from '../util';
import { CPlayer } from '../ecs/game-components';

export const isLeaderCond = (c: RoomContext, e: RoomEvents) => {
  if (e.type === 'PICK') {
    const players = filterByComponent(c.entities, CPlayer.name);
    const index = indexOfPlayer(players, e.player.displayUsername);

    return index === c.game.leader;
  }
  return false;
};

export const minPlayers = (c: RoomContext, _: RoomEvents) => {
  const players = filterByComponent(c.entities, CPlayer.name);

  const satPlayers = players.filter(
    (player) => (player.components[CPlayer.name] as CPlayer).satDown,
  );

  return satPlayers.length >= 5;
};
