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

  description = 'Thinks they are Morgana; sees a fake spy team; their Fail counts as Success.';
  orderPriorityInOptions = 72;

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    const spies: string[] = [];
    if (!this.room.gameStarted) return { spies, roleTags: {} };

    // Count real spies and detect Oberon (Morgana doesn’t see Oberon)
    let realSpyCount = 0;
    let hasOberon = false;

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      const p = this.room.playersInGame[i];
      if (p.alliance === Alliance.Spy) {
        realSpyCount++;
        if (p.role === Role.Oberon) hasOberon = true;
      }
    }

    const k = Math.max(1, realSpyCount - (hasOberon ? 1 : 0)); // include self, so at least 1

    const self = this.getSelfUsername();
    if (!self) return { spies, roleTags: {} };

    // Start with self
    spies.push(this.room.anonymizer.anon(self));

    const othersNeeded = k - 1;
    if (othersNeeded <= 0) return { spies, roleTags: {} };

    // Pool of non-self usernames
    const pool = this.room.playersInGame
      .map((p: any) => p.username)
      .filter((u: string) => u !== self);

    // Shuffle pool and pick othersNeeded
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picks = pool.slice(0, othersNeeded);

    for (const u of picks) spies.push(this.room.anonymizer.anon(u));

    return { spies, roleTags: {} };
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
