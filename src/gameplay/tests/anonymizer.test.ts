import { Anonymizer } from '../anonymizer';

describe('Anonymizer', () => {
  let anonymizer: Anonymizer;
  const baseUsernames = ['0', '1', '2', '3', '4', '5'];

  beforeEach(() => {
    anonymizer = new Anonymizer();
  });

  it('Can do simple anonymizing', () => {
    anonymizer.initialise(baseUsernames, true);

    for (const username of baseUsernames) {
      // Anonymizing and deanonymizing immediately should be equal.
      expect(anonymizer.deAnon(anonymizer.anon(username))).toEqual(username);

      // Username should not be the same though
      expect(anonymizer.anon(username)).not.toEqual(username);
    }
  });

  it('Can do simple anonymizing many', () => {
    anonymizer.initialise(baseUsernames, true);

    const anonymizedUsernames = anonymizer.anonMany(baseUsernames);
    const deAnonymizedUsernames = anonymizer.deAnonMany(anonymizedUsernames);

    for (let i = 0; i < baseUsernames.length; i++) {
      expect(deAnonymizedUsernames[i]).toEqual(baseUsernames[i]);
      expect(anonymizedUsernames[i]).not.toEqual(baseUsernames[i]);
    }
  });

  it("Doesn't anonymize if disabled", () => {
    anonymizer.initialise(baseUsernames, false);

    for (const username of baseUsernames) {
      expect(anonymizer.anon(username)).toEqual(username);
    }
  });

  it('Reveals usernames on game end', () => {
    // On game end, a username e.g. "asdf" and anon username "Pikachu"
    // should appear like "asdf (Pikachu)"

    anonymizer.initialise(baseUsernames, true);
    const anonymizedUsernames = anonymizer.anonMany(baseUsernames);

    anonymizer.setGameFinished();

    const postGameFinishAnonymizedUsernames =
      anonymizer.anonMany(baseUsernames);

    for (let i = 0; i < baseUsernames.length; i++) {
      expect(postGameFinishAnonymizedUsernames[i]).toEqual(
        `${baseUsernames[i]} (${anonymizedUsernames[i]})`,
      );
    }
  });

  it('Returns the unrevealed username after game end if requested', () => {
    // We also send the unrevealed username to the frontend after the game ends so that anonymized chat highlighting still works
    anonymizer.initialise(baseUsernames, true);
    const anonymizedUsernames = anonymizer.anonMany(baseUsernames);

    anonymizer.setGameFinished();

    const postGameFinishAnonymizedUsernames = baseUsernames.map((username) => {
      return anonymizer.anon(username, false);
    });

    for (let i = 0; i < baseUsernames.length; i++) {
      expect(postGameFinishAnonymizedUsernames[i]).toEqual(
        anonymizedUsernames[i],
      );
    }
  });

  it('Can recover', () => {
    anonymizer.initialise(baseUsernames, true);
    const anonymizedUsernames = anonymizer.anonMany(baseUsernames);

    const data = anonymizer.serialise();
    anonymizer = new Anonymizer();
    anonymizer.initialise(baseUsernames, true);
    anonymizer.recover(data);

    const anonymizedUsernames2 = anonymizer.anonMany(baseUsernames);
    expect(anonymizedUsernames2).toEqual(anonymizedUsernames);

    const deAnonymizedUsernames = anonymizer.deAnonMany(anonymizedUsernames2);
    expect(deAnonymizedUsernames).toEqual(baseUsernames);
  });
});
