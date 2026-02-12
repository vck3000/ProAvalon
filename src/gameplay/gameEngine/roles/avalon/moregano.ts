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

  private SpiesThatMoreganoSees?: string[]; // includes self username as first element

  see(): See {
    if (!this.room.gameStarted) return { spies: [], roleTags: {} };

    if (!this.SpiesThatMoreganoSees) {
      let visibleSpyCount = 0;

      for (const p of this.room.playersInGame) {
        if (p.alliance === Alliance.Spy) {
          if (p.role === Role.Oberon) continue;
          visibleSpyCount++;
        }
      }

      const k = Math.max(1, visibleSpyCount);
      const othersNeeded = k - 1;

      const pool = this.room.playersInGame
        .filter((p: any) => p.role !== Role.Moregano)
        .map((p: any) => p.username);

      shuffleArray(pool);

      const selfPlayer = this.room.playersInGame.find(
        (p: any) => p.role === Role.Moregano,
      );
      if (!selfPlayer) return { spies: [], roleTags: {} };

      const selfUsername = selfPlayer.username;

      const picks = pool.slice(0, Math.max(0, othersNeeded));

      // Cache REAL usernames (self first)
      this.SpiesThatMoreganoSees = [selfUsername, ...picks];
    }

    return {
      spies: this.SpiesThatMoreganoSees.map((u) =>
        this.room.anonymizer.anon(u),
      ),
      roleTags: {},
    };
  }

  checkSpecialMove(): void {}
  getPublicGameData() {
    return { SpiesMoreganoSaw: this.SpiesThatMoreganoSees ?? [] }; // real usernames
  }
}

export default Moregano;
