import CardEntity from './cards/cardEntity';

export class Card {
  username: string; // Lowercase!!
  entity: CardEntity;

  constructor(username: string, entity: CardEntity) {
    this.username = username;
    this.entity = entity;
  }
}