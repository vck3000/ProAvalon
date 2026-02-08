import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

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

  private cachedSpyUsernames?: string[]; // includes self username as first element

  see(): See {
    if (!this.room.gameStarted) return { spies: [], roleTags: {} };

    const self = this.getSelfUsername();
    if (!self) return { spies: [], roleTags: {} };

    if (!this.cachedSpyUsernames) {
      // Count real spies and detect Oberon (Morgana doesn’t see Oberon)
      let realSpyCount = 0;
      let hasOberon = false;

      for (const p of this.room.playersInGame) {
        if (p.alliance === Alliance.Spy) {
          realSpyCount++;
          if (p.role === Role.Oberon) hasOberon = true;
        }
      }

      const k = Math.max(1, realSpyCount - (hasOberon ? 1 : 0)); // include self, so at least 1
      const othersNeeded = k - 1;

      const pool = this.room.playersInGame
        .map((p: any) => p.username)
        .filter((u: string) => u !== self);

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const picks = pool.slice(0, Math.max(0, othersNeeded));

      // Cache REAL usernames (self first)
      this.cachedSpyUsernames = [self, ...picks];
    }

    return {
      spies: this.cachedSpyUsernames.map((u) => this.room.anonymizer.anon(u)),
      roleTags: {},
    };
  }

  private getSelfUsername(): string {
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === Role.Moregano) {
        return this.room.playersInGame[i].username;
      }
    }
    return '';
  }

  checkSpecialMove(): void {}
  getPublicGameData(): any {}
}

export default Moregano;
