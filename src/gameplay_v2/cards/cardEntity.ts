import { Round } from '../gameTypes';
import Component from '../roles/components/component';

export default class CardEntity {
  components: Component[];
  round: Round;

  constructor(round: Round) {
    this.round = round;
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
