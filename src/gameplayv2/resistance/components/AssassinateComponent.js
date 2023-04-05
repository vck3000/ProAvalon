export class AssassinateComponent{
    constructor(killer, victim){
        this.killer = killer;
        this.victim = victim;
    }

    //get the killer's role
    getKiller(){
        console.log("I am getting the killer's role");
        return this.killer;
    }

    setKiller(newKiller){
        console.log("I am setting a new killer");
        this.killer = newKiller;  
    }

    getVictim(){
        return this.victim;
    }

    setVictim(newVictim){
        this.description = newVictim;
    }
    
    //execute the victim if conditions are met
    executeAssassination(killer, victim){
        //check if killer's role enables killing
        //if(killer.role.canKill == true){
        //then set victim's status to killed
        //}
    }
}