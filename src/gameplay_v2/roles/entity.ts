import Component from './components/component';
import { Alliance } from '../gameTypes';

export default class Entity {
  alliance: Alliance;
  components: Component[];

  constructor(alliance: Alliance) {
    this.alliance = alliance;
    this.components = [];
  }

  public addComponent(component: any): void {
    this.components.push(component);
  }

  // This is commented as it is not necessarily needed for now
  // public addComponents(...components: any[]): void {
  //   components.forEach((component) => this.addComponent(component));
  // }
  
  public removeComponent(component: any): void {
    const componentIndex = this.components.findIndex((c) => c.constructor.name === component.constructor.name);
    if (componentIndex !== -1) {
        this.components.splice(componentIndex, 1);
    }
  }
}
