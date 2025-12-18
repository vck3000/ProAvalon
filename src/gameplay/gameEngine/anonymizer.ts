import shuffleArray from '../../util/shuffleArray';
import { IRecoverable, RecoverableComponent } from './types';

const ANON_NAMES = [
  'Charizard',
  'Bulbasaur',
  'Gengar',
  'Umbreon',
  'Eevee',
  'Flygon',
  'Metagross',
  'Swampert',
  'Arcanine',
  'Lucario',
];

export class Anonymizer implements IRecoverable {
  // IRecoverable
  name = RecoverableComponent.Anonymizer;

  private initialised = false;

  private usernamesToAnonMap: Map<string, string> = new Map();
  private anonToUsernamesMap: Map<string, string> = new Map();

  private anonymize = false;
  private gameFinished = false;

  initialise(usernames: string[], anonymize: boolean) {
    this.anonymize = anonymize;
    shuffleArray(ANON_NAMES);

    for (let i = 0; i < usernames.length; i++) {
      if (anonymize) {
        this.usernamesToAnonMap.set(usernames[i], ANON_NAMES[i]);
        this.anonToUsernamesMap.set(ANON_NAMES[i], usernames[i]);
      } else {
        this.usernamesToAnonMap.set(usernames[i], usernames[i]);
        this.anonToUsernamesMap.set(usernames[i], usernames[i]);
      }
    }

    this.initialised = true;
  }

  setGameFinished(): void {
    this.gameFinished = true;
  }

  anon(username: string, revealIfFinished = true): string {
    if (
      !this.initialised ||
      !this.anonymize ||
      !this.usernamesToAnonMap.has(username)
    ) {
      return username;
    }

    if (this.gameFinished && revealIfFinished) {
      return this.usernameAnonReveal(username);
    }

    return this.usernamesToAnonMap.get(username);
  }

  anonMany(usernames: string[]): string[] {
    return usernames.map((username) => this.anon(username));
  }

  usernameAnonReveal(username: string): string {
    if (
      !this.initialised ||
      !this.anonymize ||
      !this.usernamesToAnonMap.has(username)
    ) {
      return username;
    }

    if (!this.usernamesToAnonMap.has(username)) {
      throw new Error(`Could not find username to map to anon: ${username}`);
    }

    return `${username} (${this.usernamesToAnonMap.get(username)})`;
  }

  // De-anonymize
  deAnon(anon: string): string {
    if (
      !this.initialised ||
      !this.anonymize ||
      !this.anonToUsernamesMap.has(anon)
    ) {
      return anon;
    }

    return this.anonToUsernamesMap.get(anon);
  }

  deAnonMany(anons: string[]): string[] {
    return anons.map((anons) => this.deAnon(anons));
  }

  serialise(): string {
    return JSON.stringify({
      usernameToAnon: Array.from(this.usernamesToAnonMap.entries()),
    });
  }

  recover(dataStr: string): void {
    const data = JSON.parse(dataStr);
    for (const [username, anon] of data['usernameToAnon']) {
      this.usernamesToAnonMap.set(username, anon);
      this.anonToUsernamesMap.set(anon, username);
    }
  }
}
