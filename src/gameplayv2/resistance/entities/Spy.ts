import { AllianceComponent } from  '../components/AllianceComponent';
import { DescriptionComponent } from '../components/DescriptionComponent';
import { RoleComponent } from '../components/RoleComponent';

Spy.nextId = 0;
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

    addComponents(...components) {
        components.forEach(component => this.addComponent(component));
    }
      
    removeComponent(component) {
        delete this.components[component.constructor.name];
    }
      
    getComponent(componentClass) {
        return this.components[componentClass.name];
    }

    static getNextID() {
        return Spy.nextId++;
    }
}
