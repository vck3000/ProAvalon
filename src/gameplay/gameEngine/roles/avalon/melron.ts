import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';

/**
 * Melron (Resistance) — believes they are Merlin.
 * Sees a RANDOM set of players as spies: size mirrors Merlin’s count
 * (real spies minus 1 if Mordred/MordredAssassin is in play).
 * Percival does NOT see Melron.
 */
class Melron implements IRole {
  room: Game;

  static role = Role.Melron;
  role = Role.Melron;

  alliance = Alliance.Resistance;

  description = 'Thinks they are Merlin; sees a random “spy” list mirroring Merlin’s count.';
  orderPriorityInOptions = 75; // place near Percival/Morgana if you care about ordering

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  see(): See {
    const spies: string[] = [];
    if (!this.room.gameStarted) return { spies, roleTags: {} };

    // Count real spies and detect Mordred/MordredAssassin (Merlin doesn’t see them)
    let realSpyCount = 0;
    let hasMordred = false;

    for (let i = 0; i < this.room.playersInGame.length; i++) {
      const p = this.room.playersInGame[i];
      if (p.alliance === Alliance.Spy) {
        realSpyCount++;
        if (p.role === Role.Mordred || p.role === Role.MordredAssassin) {
          hasMordred = true;
        }
      }
    }

    const k = Math.max(0, realSpyCount - (hasMordred ? 1 : 0));

    // Build pool of all non-self usernames
    const self = this.getSelfUsername();
    const pool = this.room.playersInGame
      .map((p: any) => p.username)
      .filter((u: string) => u !== self);

    // Shuffle pool (Fisher–Yates) and pick k
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picks = pool.slice(0, k);

    for (const u of picks) spies.push(this.room.anonymizer.anon(u));

    return { spies, roleTags: {} };
  }

  private getSelfUsername(): string {
    for (let i = 0; i < this.room.playersInGame.length; i++) {
      if (this.room.playersInGame[i].role === Role.Melron) {
        return this.room.playersInGame[i].username;
      }
    }
    return '';
  }

  checkSpecialMove(): void {}
  getPublicGameData(): any {}
}

export default Melron;
