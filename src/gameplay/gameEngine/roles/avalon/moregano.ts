import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';
import shuffleArray from '../../../../util/shuffleArray';

/**
 * Moregano (Resistance) — believes they are Morgana.
 * Sees a FAKE spy team that MUST include self; size mirrors Morgana’s count
 * (real spies minus Oberon).
 * If they press "Fail", it is silently processed as "Succeed".
 */
class Moregano implements IRole {
  room: Game;

  static role = Role.Moregano;
  role = Role.Moregano;

  alliance = Alliance.Resistance;

  description =
    'Thinks they are Morgana; sees a fake spy team; their Fail counts as Success.';
  orderPriorityInOptions = 72;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  private spiesThatMoreganoSees?: string[]; // includes self username as first element

  see(): See {
    if (!this.room.gameStarted) {
      return { spies: [], roleTags: {} };
    }

    if (!this.spiesThatMoreganoSees) {
      this.initialiseMoreganoView();
    }

    return {
      spies: this.spiesThatMoreganoSees.map((u) =>
        this.room.anonymizer.anon(u),
      ),
      roleTags: {},
    };
  }

  private initialiseMoreganoView(): void {
    let visibleSpyCount = 0;

    for (const p of this.room.playersInGame) {
      if (p.alliance === Alliance.Spy) {
        if (p.role === Role.Oberon) {
          continue;
        }

        visibleSpyCount++;
      }
    }

    const othersNeeded = visibleSpyCount - 1;

    const pool = this.room.playersInGame
      .filter((p: any) => p.role !== Role.Moregano)
      .map((p: any) => p.username);

    shuffleArray(pool);

    const selfPlayer = this.room.playersInGame.find(
      (p: any) => p.role === Role.Moregano,
    );

    if (!selfPlayer) {
      throw new Error(
        'Invariant violated: Moregano role instantiated but player not found',
      );
    }

    const selfUsername = selfPlayer.username;

    const picks = pool.slice(0, othersNeeded);

    // Cache REAL usernames (self first)
    this.spiesThatMoreganoSees = [selfUsername, ...picks];
  }

  checkSpecialMove(): void {}

  getPublicGameData() {
    return { spiesMoreganoSaw: this.spiesThatMoreganoSees ?? [] }; // real usernames
  }
}

export default Moregano;
