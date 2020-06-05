import { ReactElement } from 'react';
import { Definitions, definitions } from './definitions';


class Glossary {
  private static definitions: Definitions = definitions;

  private static jargonRegex = `\\b(${Object.keys(Glossary.definitions).join('|')})\\b`;

  static hasDefinition(word: string): boolean {
    return Object.prototype.hasOwnProperty.call(
      Glossary.definitions,
      word.toLowerCase(),
    );
  }

  static getDefinition(word: string): string {
    return Glossary.definitions[word.toLowerCase()];
  }

  static splitMessage(message: string): string[] {
    return message.split(RegExp(Glossary.jargonRegex, 'i'));
  }

  // disabling the warning is acceptable because we
  // will not be changing the order of the elements
  static transform(message: string): ReactElement[] {
    return Glossary.splitMessage(message).map((s, i) =>
      Glossary.hasDefinition(s) ? (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          <abbr title={Glossary.getDefinition(s)}>{s}</abbr>
        </span>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>{s}</span>
      ),
    );
  }
}

export default Glossary;
