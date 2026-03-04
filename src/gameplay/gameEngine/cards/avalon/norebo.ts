import { Card, ICard } from '../types';
import { SocketUser } from '../../../../sockets/types';
import { Alliance } from '../../types';
import shuffleArray from '../../../../util/shuffleArray';



class Norebo implements ICard {
  private thisRoom: any;

  static card = Card.Norebo;
  card = Card.Norebo;

  indexOfPlayerHolding = -1; //TODO not sure if should be 0 like other cards.

  description =
'A random resistance member who unknowingly appears as a spy to other spies. Card does not change hands.';
  constructor(thisRoom: any) {
    this.thisRoom = thisRoom;
  }

  initialise(): void {
    this.setHolder(0)
      //the number 0 doesn't matter
    ;
  }

  setHolder(index: number): void {
    //assign to a random Resistance member
    let resPlayersIndexes=[];
    for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
      if (this.thisRoom.playersInGame[i].alliance === Alliance.Resistance) {
        resPlayersIndexes.push(i);
        this.indexOfPlayerHolding=i;
      }
      }
      resPlayersIndexes = shuffleArray(resPlayersIndexes);
      this.indexOfPlayerHolding=resPlayersIndexes[0];
     // console.log("Norebo started with player", this.indexOfPlayerHolding);
    }

  checkSpecialMove(
    socket: SocketUser,
    buttonPressed: 'yes' | 'no',
    selectedPlayers: string[],
  ): boolean {
    return false;
  }

  getPublicGameData(): any {
    /* TODO: (Can delete this function. Not absolutely necessary)
        Public data to show the user(s) e.g. who holds the lady of the lake */
    return {
      norebo: {
        index: this.indexOfPlayerHolding,
        name: this.card,
      },
    };
  }
}

export default Norebo;
