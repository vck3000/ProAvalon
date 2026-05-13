import Component from './components/component';
import { Alliance } from '../gameTypes';

export default class Entity {
  alliance: Alliance;
  components: Component[];

  constructor(alliance: Alliance) {
    this.alliance = alliance;
    this.components = [];
  }
}
