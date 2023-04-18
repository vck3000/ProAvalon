import { AllianceComponent } from '../components/AllianceComponent';
import { RoleComponent } from '../components/RoleComponent';
import { DescriptionComponent } from '../components/DescriptionComponent';
import { Entity } from '../system';

class Morgana extends Player {
    static nextId: number = 0;
    id: number;
    components: Component[];

    constructor() {
        super();
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent('Morgana'));
        this.addComponent(new RoleComponent('Morgana'));
        this.addComponent(new DescriptionComponent('A spy who looks like Merlin to Percival.'));
    }

    addComponent(component: Component): void {
        this.components.push(component);
    }

    removeComponent(component: Component): void {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }
    }

    static getNextID(): number {
        return Morgana.nextId++;
    }
}
