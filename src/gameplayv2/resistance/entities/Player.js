const { AllianceComponent } = require("../components/AllianceComponent");
const { DescriptionComponent } = require("../components/DescriptionComponent");
const { RoleComponent } = require("../components/RoleComponent");

//A basic player should have the alliancecomponent, descriptioncomponent, and rolecomponent
class Player{
    constructor(){
        this.components = {};
        this.addComponent(new DescriptionComponent());
        this.addComponent(new AllianceComponent());
        this.addComponent(new RoleComponent());
    }

    addComponent(component) {
        this.components[component.constructor.name] = component;
    }

    getComponent(componentName) {
        return this.components[componentName];
    }
    
      removeComponent(componentName) {
        delete this.components[componentName];
    }
}