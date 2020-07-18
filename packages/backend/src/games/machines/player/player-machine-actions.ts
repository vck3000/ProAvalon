import { assign, actions } from 'xstate';
import { PlayerContext, PlayerEvents } from './player-machine';

const { pure } = actions;

export const setTeamVote = assign<PlayerContext, PlayerEvents>({
  teamVote: (_, e) => {
    if (e.type === 'TEAM_VOTE') {
      return e.vote;
    }
    return null;
  },
});

export const setMissionVote = assign<PlayerContext, PlayerEvents>({
  missionVote: (_, e) => {
    if (e.type === 'MISSION_VOTE') {
      return e.vote;
    }
    return null;
  },
});

export const setPlayer = assign<PlayerContext, PlayerEvents>({
  player: (_, e) => (e as any).player,
});

export const setPlayerGameData = assign<PlayerContext, PlayerEvents>({
  gamePlayerData: (_, e) => (e as any).gamePlayerData,
});

export const runPlayerSystems = pure((c: PlayerContext, e: PlayerEvents) => {
  const actionsToExecute: any[] = [];

  if (e.type === 'RUN_SYSTEMS') {
    for (const system of c.gamePlayerData.systems) {
      const res = system.system(e.gameState, c, e);
      if (res) {
        actionsToExecute.push(res);

        // Example on how to set actions on oneself. Set own username to something.
        // actionsToExecute.push(
        //   assign<PlayerContext, PlayerEvents>((c, _) => ({
        //     ...c,
        //     player: { ...c.player, username: 'something crazy' },
        //   })),
        // );

        // Only allow one system to activate at a time
        break;
      }
    }
  }

  return actionsToExecute;
});

// Execute the special event for the system
export const playerSpecial = pure((c: PlayerContext, e: PlayerEvents) => {
  const actionsToExecute: any[] = [];

  if (e.type === 'SPECIAL') {
    for (const system of c.gamePlayerData.systems) {
      const res = system.handleEvent(e.gameState, { ...e.event });
      if (res) {
        actionsToExecute.push(res);

        // Only allow one handleEvent to activate at a time
        break;
      }
    }
  }

  return actionsToExecute;
});
