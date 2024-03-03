import shuffleArray from '../util/shuffleArray';

export class Anonymizer {
  private initialised = false;

  private usernamesToAnonMap: Map<string, string> = new Map();
  private anonToUsernamesMap: Map<string, string> = new Map();

  private anonymize = false;
  private gameFinished = false;
  private anonNames = [
    'Bulbasaur',
    'Charmander',
    'Squirtle',
    'Treeko',
    'Torchic',
    'Mudkip',
    'Turtwig',
    'Chimchar',
    'Piplup',
    'MewTwo',
  ];

  initialise(usernames: string[], anonymize: boolean) {
    this.anonymize = anonymize;
    shuffleArray(this.anonNames);

    for (let i = 0; i < usernames.length; i++) {
      if (anonymize) {
        this.usernamesToAnonMap.set(usernames[i], this.anonNames[i]);
        this.anonToUsernamesMap.set(this.anonNames[i], usernames[i]);
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

  anon(username: string): string {
    if (!this.initialised || !this.anonymize) {
      return username;
    }

    if (!this.usernamesToAnonMap.has(username)) {
      throw new Error(`Could not find username to map to anon: ${username}`);
    }

    if (this.gameFinished) {
      return this.usernameAnonReveal(username);
    }

    return this.usernamesToAnonMap.get(username);
  }

  anonMany(usernames: string[]): string[] {
    return usernames.map((username) => this.anon(username));
  }

  usernameAnonReveal(username: string): string {
    if (!this.initialised || !this.anonymize) {
      return username;
    }

    if (!this.usernamesToAnonMap.has(username)) {
      throw new Error(`Could not find username to map to anon: ${username}`);
    }

    return `${username} (${this.usernamesToAnonMap.get(username)})`;
  }

  // De-anonymize
  deAnon(anon: string): string {
    if (!this.initialised || !this.anonymize) {
      return anon;
    }

    if (!this.anonToUsernamesMap.has(anon)) {
      throw new Error(`Could not find anon to map to username: ${anon}`);
    }

    return this.anonToUsernamesMap.get(anon);
  }

  deAnonMany(anons: string[]): string[] {
    return anons.map((anons) => this.deAnon(anons));
  }
}
