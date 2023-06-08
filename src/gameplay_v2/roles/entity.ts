import Component from './components/component';
import { Alliance } from '../gameTypes';

export default class Entity {
  alliance: Alliance;
  private readonly components: Record<string, Component>;

  constructor(alliance: Alliance) {
    this.alliance = alliance;
    this.components = {};
  }

  public getComponent(component: string): Component {
    return this.components[component];
  }

  public addComponent(component: Component): void {
    this.components[component.nameC] = component;
  }

  public removeComponent(component: Component): void {
    delete this.components[component.nameC];
  }
}
