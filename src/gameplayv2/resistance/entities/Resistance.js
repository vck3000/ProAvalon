import { alliance, AllianceComponent } from  '../components/AllianceComponent'
import { world } from '../system'

Resistance.nextId = 0;
class Resistance extends Player{
    constructor(){
        this.id = Resistance.getNextID();
        this.components = [];
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
        return Resistance.nextId++;
    }
}
