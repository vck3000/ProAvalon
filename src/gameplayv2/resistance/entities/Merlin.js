import { alliance } from '../components/alliance'
import { world } from '../system'

class Merlin extends Resistance {

    constructor() {
        // Not know why player js class has nextID variable, so not know how to use it
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent("Resistance"));
        this.addComponent(new RoleComponent("Merlin"));
        this.addComponent(new DescriptionComponent("Merlin: A resistance can see all spys"));
        this.addComponent(createSeeComponent());
    }

    createSeeComponent() {
        // Cannot see mordred but not know how to add here
        const see = new SeeComponent(["spy", "Morgana", "Oberon", "Assassin"], null, true);
        return see
    }


    // Now code of room not finished yet so need wait main class to complete first then I can change code below
    // see(thisRoom) {
    //     // This function is to return what spy merlin can see
    //     if (thisRoom.gameStarted === true) {
    //         const obj = {};

    //         const array = [];

    //         for (let i = 0; i < thisRoom.playersInGame.length; i++) {
    //             if (thisRoom.playersInGame[i].alliance === 'Spy') {
    //                 if (thisRoom.playersInGame[i].role === 'Mordred') {
    //                     // don't add mordred for Merlin to see
    //                 } else {
    //                     // add the spy
    //                     array.push(thisRoom.playersInGame[i].username);
    //                 }
    //             }
    //         }

    //         obj.spies = array;
    //         return obj;
    //     }
    // }
}
export default Merlin;