import { sendParent } from 'xstate';
import { GameSystem } from './types';

export const assassinSystem: GameSystem = {
  name: 'assassin',
  system: (s) => {
    if (
      typeof s.value !== typeof '' &&
      // state coming in at the moment is the PREVIOUS state!
      // How can I make this the next state?
      (s.value as any).game.standard === 'pick'
    ) {
      return sendParent('SPECIAL_STATE_ENTER');
    }
    return undefined;
  },
  handleEvent: (_, event) => {
    if (event.type === 'assassin' && event.data.target) {
      // console.log(`Shot ${event.data.target}`);
      return sendParent('SPECIAL_STATE_LEAVE');
    }
    return undefined;
  },
};
