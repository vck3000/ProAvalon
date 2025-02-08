import GameWrapper from '../../gameplay/gameEngine/gameWrapper';
import { WAITING } from '../../gameplay/gameEngine/game';

export class CreateRoomFilter {
  // Returns true if user can create a room. Else false.
  createRoomRequest(username: string, rooms: GameWrapper[]): boolean {
    // User cannot make a room if they already have one that is in "waiting" status.
    const waitingRooms = rooms.filter(
      (room) => room && room.getStatus() === WAITING,
    );

    const sameUserWithWaitingRooms = waitingRooms.filter(
      (room) => room.host.toLowerCase() === username.toLowerCase(),
    );

    return sameUserWithWaitingRooms.length === 0;
  }
}
