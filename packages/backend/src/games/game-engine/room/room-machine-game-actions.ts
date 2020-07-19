import { actions, assign } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import { addRoles } from '../ecs/game-assemblages';
import { CPlayer, CVoteTeam } from '../ecs/game-components';
import { allSystems } from '../ecs/game-systems';
import { filterByComponent, indexOfPlayer } from '../util';

const { pure } = actions;

const NUM_SPIES: Record<number, number> = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
};

export const startGame = assign<RoomContext, RoomEvents>((c, _) => {
  // test
  const { entities } = c;
  const players = filterByComponent(entities, CPlayer.name);
  const numPlayers = players.length;
  const leader = Math.floor(Math.random() * numPlayers);

  let count = 0;

  // Set in resistance
  for (let i = 0; i < players.length - NUM_SPIES[players.length]; i += 1) {
    addRoles.Resistance(players[count]);
    count += 1;
  }

  // Set in spies
  for (let i = 0; i < NUM_SPIES[players.length]; i += 1) {
    addRoles.Spy(players[count]);
    count += 1;
  }

  // Give the last spy a special assassin role
  addRoles.Assassin(players[players.length - 1]);

  return {
    ...c,
    game: {
      ...c.game,
      leader,
    },
    systems: [], // ['SAssassin'],
  };
});

// TODO
export const runSystems = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  // console.log('test');
  // console.log(c);
  // console.log(allSystems);

  for (const system of systems) {
    // console.log(`System: ${system}`);
    const res = allSystems[system].update(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  return actionsToExecute;
});

export const addSystem = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'ADD_SYSTEM') {
    return {
      ...c,
      systems: [...c.systems, e.systemName],
    };
  }

  return {
    ...c,
  };
});

export const handleSpecialEvent = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  for (const system of systems) {
    const res = allSystems[system].handleEvent(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  return actionsToExecute;
});

export const pickEvent = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'PICK') {
    return {
      ...c,
      game: { ...c.game, team: e.data.team },
    };
  }

  return { ...c };
});

export const voteTeamEvent = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'VOTE_TEAM') {
    const { entities } = c;

    const index = indexOfPlayer(entities, e.player.displayUsername);

    // voteTeamComp here is a reference and changes to it will change entities too.
    const voteTeamComp = entities[index].components[
      CVoteTeam.name
    ] as CVoteTeam;

    voteTeamComp.vote = e.data.vote;

    return {
      ...c,
      entities,
    };
  }

  return { ...c };
});

export const voteTeamFinish = assign<RoomContext, RoomEvents>((c, _) => {
  const { entities } = c;

  // Reset the votes
  const entitiesCanVote = filterByComponent(entities, CVoteTeam.name);

  // Get the components
  const voteTeamComps = entitiesCanVote.map(
    (entity) => entity.components[CVoteTeam.name] as CVoteTeam,
  );

  // Mutate the vote to undefined.
  for (const comp of voteTeamComps) {
    comp.vote = undefined;
  }

  // Increment the leader
  const numOfPlayers = filterByComponent(entities, CPlayer.name).length;
  const newLeader = (c.game.leader + 1) % (numOfPlayers - 1);

  return {
    ...c,
    entities,
    game: {
      ...c.game,
      leader: newLeader,
    },
  };
});
