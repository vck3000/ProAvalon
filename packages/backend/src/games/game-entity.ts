import { AllComponents, IAllComponents } from './game-components';

export class Entity {
  id: number;
  // Some hacky stuff needed here to make AllComponents and
  // IAllComponents work together.
  components: Record<string, IAllComponents>;

  constructor(id: number) {
    this.id = id;
    this.components = {};
  }

  addComponent(component: AllComponents) {
    this.components[component.name] = component as IAllComponents;
  }

  removeComponent(name: string) {
    delete this.components[name];
  }
}
