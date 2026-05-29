import { Alliance, See } from '../../types';
import { IRole, Role } from '../types';
import Game from '../../game';
import { Phase } from '../../phases/types';
import shuffleArray from '../../../../util/shuffleArray';

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

  description =
    'Thinks they are Merlin; sees a random “spy” list mirroring Merlin’s count.';
  orderPriorityInOptions = 75; // place near Percival/Morgana if you care about ordering

  specialPhase: string;

  constructor(thisRoom: any) {
    this.room = thisRoom;
  }

  private spiesThatMelronSees?: string[];

  see(): See {
    if (!this.room.gameStarted) {
      return { spies: [], roleTags: {} };
    }

    if (!this.spiesThatMelronSees) {
      this.initialiseMelronView();
    }

    return {
      spies: this.spiesThatMelronSees.map((u) => this.room.anonymizer.anon(u)),
      roleTags: {},
    };
  }

  private initialiseMelronView(): void {
    let visibleSpyCount = 0;
    let visibleSpyUsernames = [];

    for (const p of this.room.playersInGame) {
      if (p.alliance !== Alliance.Spy) {
        continue;
      }

      if (p.role === Role.Mordred || p.role === Role.MordredAssassin) {
        continue;
      }

      visibleSpyCount++;
      visibleSpyUsernames.push(p.username);
    }

    const k = visibleSpyCount;

    const pool = this.room.playersInGame
      .filter((p: any) => p.role !== Role.Melron)
      .map((p: any) => p.username);

    let melronViewArray = [];
    const visibleSpySet = new Set(visibleSpyUsernames);

    //Ensures that the Melron does not see the real Spy team
    do {
      shuffleArray(pool);
      melronViewArray = pool.slice(0, k);
    } while (
      melronViewArray.every(item => visibleSpySet.has(item))
    );
    
    this.spiesThatMelronSees = melronViewArray;
  }

  checkSpecialMove(): void {}

  getPublicGameData() {
    if (this.room.phase !== Phase.Finished) {
      return null;
    }
    return { spiesMelronSaw: this.spiesThatMelronSees ?? [] }; // real usernames
  }
}

export default Melron;
