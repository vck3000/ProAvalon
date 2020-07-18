import { State, SendAction } from 'xstate';
import { RoomContext, RoomEvents } from '../room/room-machine';
import { PlayerContext, PlayerEvents } from '../player/player-machine';

export interface SpecialEvent {
  type: string;
  data: any;
}

export interface GameSystem {
  name: string;

  // This function runs the system and will send an action to
  // redirect main machine to special state.
  system: (
    state: State<RoomContext, RoomEvents>,
    context: PlayerContext,
    event: PlayerEvents,
  ) => SendAction<any, any, any> | undefined;

  // If the system has a special state, this function handles it.
  handleEvent: (
    state: State<RoomContext, RoomEvents>,
    event: SpecialEvent,
  ) => SendAction<any, any, any> | undefined;
}
