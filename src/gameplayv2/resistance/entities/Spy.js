import { alliance } from  '../components/alliance'
import { world } from '../system'

Resistance.nextId = 0;
class Spy extends Player{
    constructor(){
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent("Spy"));
        this.addComponent(new RoleComponent("Spy"));
        this.addComponent(new DescriptionComponent("A standard Spy member."));
    }

    addComponent(component){
        this.components.push(component);
    }

    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index !== -1) {
          this.components.splice(index, 1);
        }
    }

    static getNextID() {
        return Spy.nextId++;
    }
}
