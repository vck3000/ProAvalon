import { IGame, GameActionTypes, IMission, IPlayer, SET_GAME } from './types';
import { RootState } from '..';

// const initialState: IGame = {
//   players: [],
//   missions: [],
// };

const initialState: IGame = {
  players: [
    ...['skipkayhil', 'ProNub', 'morningcatt', 'pam', 'bocaben'].map(
      (name) => ({
        displayName: name,
      }),
    ),
  ],
  history: [
    {
      fails: 0,
      proposals: [
        {
          leader: 'skipkayhil',
          team: ['skipkayhil', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: false,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'ProNub',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: false,
            ProNub: true,
            morningcatt: false,
            pam: true,
            bocaben: false,
          },
        },
        {
          leader: 'morningcatt',
          team: ['bocaben', 'pam'],
          votes: {
            skipkayhil: false,
            ProNub: false,
            morningcatt: false,
            pam: true,
            bocaben: true,
          },
        },
        {
          leader: 'pam',
          team: ['skipkayhil', 'morningcatt'],
          votes: {
            skipkayhil: true,
            ProNub: false,
            morningcatt: true,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'bocaben',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: true,
            pam: true,
            bocaben: true,
          },
        },
      ],
    },
    {
      fails: 2,
      proposals: [
        {
          leader: 'skipkayhil',
          team: ['skipkayhil', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: false,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'ProNub',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: false,
            ProNub: true,
            morningcatt: false,
            pam: true,
            bocaben: false,
          },
        },
        {
          leader: 'morningcatt',
          team: ['bocaben', 'pam'],
          votes: {
            skipkayhil: false,
            ProNub: false,
            morningcatt: false,
            pam: true,
            bocaben: true,
          },
        },
        {
          leader: 'pam',
          team: ['skipkayhil', 'morningcatt'],
          votes: {
            skipkayhil: true,
            ProNub: false,
            morningcatt: true,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'bocaben',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: true,
            pam: true,
            bocaben: true,
          },
        },
      ],
    },
    {
      fails: 0,
      proposals: [
        {
          leader: 'skipkayhil',
          team: ['skipkayhil', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: false,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'ProNub',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: false,
            ProNub: true,
            morningcatt: false,
            pam: true,
            bocaben: false,
          },
        },
        {
          leader: 'morningcatt',
          team: ['bocaben', 'pam'],
          votes: {
            skipkayhil: false,
            ProNub: false,
            morningcatt: false,
            pam: true,
            bocaben: true,
          },
        },
        {
          leader: 'pam',
          team: ['skipkayhil', 'morningcatt'],
          votes: {
            skipkayhil: true,
            ProNub: false,
            morningcatt: true,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'bocaben',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: true,
            pam: true,
            bocaben: true,
          },
        },
      ],
    },
    {
      fails: 1,
      proposals: [
        {
          leader: 'skipkayhil',
          team: ['skipkayhil', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: false,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'ProNub',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: false,
            ProNub: true,
            morningcatt: false,
            pam: true,
            bocaben: false,
          },
        },
        {
          leader: 'morningcatt',
          team: ['bocaben', 'pam'],
          votes: {
            skipkayhil: false,
            ProNub: false,
            morningcatt: false,
            pam: true,
            bocaben: true,
          },
        },
        {
          leader: 'pam',
          team: ['skipkayhil', 'morningcatt'],
          votes: {
            skipkayhil: true,
            ProNub: false,
            morningcatt: true,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'bocaben',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: true,
            pam: true,
            bocaben: true,
          },
        },
      ],
    },
    {
      fails: undefined,
      proposals: [
        {
          leader: 'skipkayhil',
          team: ['skipkayhil', 'ProNub'],
          votes: {
            skipkayhil: true,
            ProNub: true,
            morningcatt: false,
            pam: false,
            bocaben: false,
          },
        },
        {
          leader: 'ProNub',
          team: ['pam', 'ProNub'],
          votes: {
            skipkayhil: false,
            ProNub: true,
            morningcatt: false,
            pam: true,
            bocaben: false,
          },
        },
        {
          leader: 'morningcatt',
          team: ['bocaben', 'pam'],
          votes: {
            skipkayhil: false,
            ProNub: false,
            morningcatt: false,
            pam: true,
            bocaben: true,
          },
        },
      ],
    },
  ],
};

export const playerSelector = (state: RootState): IPlayer[] =>
  state.game.players;
export const missionSelector = (state: RootState): IMission[] =>
  state.game.history;

const reducer = (state = initialState, action: GameActionTypes): IGame => {
  switch (action.type) {
    case SET_GAME:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
