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

  static transform(message: string): ReactElement[] {
    return Glossary.splitMessage(message).map((s) =>
      Glossary.hasDefinition(s) ? (
        <span>
          <abbr title={Glossary.getDefinition(s)}>{s}</abbr>
        </span>
      ) : (
        <span>{s}</span>
      ),
    );
  }
}

export default Glossary;
