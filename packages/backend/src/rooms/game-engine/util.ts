import { Entity } from './ecs/game-entity';
import { CPlayer } from './ecs/game-components';
import { RoomContext } from './room/rooms-machine-types';
import { NUM_PLAYERS_ON_MISSION } from './room/room-machine';

export const filterByComponent = (entities: Entity[], name: string) =>
  entities.filter((e) => e.components[name]);

export const getComponent = (e: Entity, name: string) => e.components[name];

export const getPlayers = (entities: Entity[]) => {
  const players = filterByComponent(entities, CPlayer.name).filter(
    (e) => (e.components[CPlayer.name] as CPlayer).satDown,
  );

  return players;
};

/**
 * Finds the index of a player given a list of player services and lowercased username.
 * Returns -1 if username doesn't exist
 */
export const indexOfPlayer = (entities: Entity[], username: string) => {
  const players = filterByComponent(entities, CPlayer.name);

  for (const [i, player] of players.entries()) {
    const comp = getComponent(player, CPlayer.name);
    if (
      (comp as CPlayer).displayUsername.toLowerCase() === username.toLowerCase()
    ) {
      return i;
    }
  }

  return -1;
};

export const getLastMissionHistory = (c: RoomContext) => {
  const gameHistory = { ...c.gameData.gameHistory };
  return gameHistory.missionHistory[gameHistory.missionHistory.length - 1];
};

export const getLastProposalHistory = (c: RoomContext) => {
  const lastMission = getLastMissionHistory(c);
  return lastMission.proposals[lastMission.proposals.length - 1];
};

export const getCurrentTeamSize = (c: RoomContext) => {
  const missionNum = c.gameData.gameHistory.missionHistory.length;
  const teamSizes = NUM_PLAYERS_ON_MISSION[c.gameData.gameSize];

  const teamSize = parseInt(teamSizes[missionNum - 1].replace('*', ''), 10);

  return teamSize;
};
