import { AllianceComponent } from '../components/AllianceComponent';
import { RoleComponent } from '../components/RoleComponent'; // Assuming you have a RoleComponent in your components folder
import { DescriptionComponent } from '../components/DescriptionComponent'; // Assuming you have a DescriptionComponent in your components folder
import { Entity } from '../system'; // Assuming you have an Entity class in your system folder


class Spy extends Player {
    static nextId: number = 0;
    id: number;
    components: Component[];

    constructor() {
        super();
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent('Spy'));
        this.addComponent(new RoleComponent('Spy'));
        this.addComponent(new DescriptionComponent('A standard Spy member.'));
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
        return Spy.nextId++;
    }
}
