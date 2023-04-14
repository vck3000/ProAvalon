//defines the type of alliances
const allianceTypes = {
    Spy: "Spy",
    Resistance: "Resistance"
};

//define a class for alliance component
export class AllianceComponent{
    constructor(allianceType){
        this.allianceType = allianceType;
        if(!Object.values(allianceTypes).includes(allianceType)){
            throw new Error('Invalid alliance type')
        }
    }

    getAlliance(){
        return this.allianceType;
    }

    setVictim(newType){
        this.allianceType = newType;
    }
}