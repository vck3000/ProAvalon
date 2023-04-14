import { AllianceComponent } from  '../components/AllianceComponent';
import { DescriptionComponent } from '../components/DescriptionComponent';
import { RoleComponent } from '../components/RoleComponent';

Resistance.nextId = 0;
class Resistance extends Player{
    constructor(){
        this.id = Resistance.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent("Resistance"));
        this.addComponent(new RoleComponent("Resistance"));
        this.addComponent(new DescriptionComponent("A standard Resistance member."));
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
        return Resistance.nextId++;
    }
}
