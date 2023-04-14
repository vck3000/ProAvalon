const { AllianceComponent } = require("../components/AllianceComponent");
const { DescriptionComponent } = require("../components/DescriptionComponent");
const { RoleComponent } = require("../components/RoleComponent");
const { RoomComponent } = require("../components/RoomComponent");

//Basic concept to make it less redundanct
//A basic player should have the alliancecomponent, descriptioncomponent, and rolecomponent
class Player{
    constructor(){
        this.components = {};
        this.addComponent(new DescriptionComponent(""));
        this.addComponent(new RoomComponent());
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