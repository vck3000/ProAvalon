//define a class for description component
export class DescriptionComponent{
    constructor(description){
        this.description = description;
    }

    stateDescription(){
        console.log("I have a description attached to me")
    }

    getDescription(){
        return this.description;
    }

    setDescription(newDescription){
        this.description = newDescription;
    }
}