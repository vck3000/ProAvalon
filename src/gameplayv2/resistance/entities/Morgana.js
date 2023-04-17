import { alliance } from '../components/alliance'
import { world } from '../system'
class Morgana extends Spy {

    constructor() {
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent("Spy"));
        this.addComponent(new RoleComponent("Morgana"));
        this.addComponent(new DescriptionComponent("Morgana: A role that makes Percival puzzled"));
        this.addComponent(createSeeComponent());
    }
    createSeeComponent() {
        const see = new SeeComponent(null, ["Merlin", "Percival"], true);
        return see
    }



    // Morgana sees all spies except oberon
    // see(thisRoom) {
    //     // THis method is to decide each round who can Morgana see
    //     if (thisRoom.gameStarted === true) {
    //         const obj = {};
    //         const array = [];

    //         for (let i = 0; i < this.thisRoom.playersInGame.length; i++) {
    //             if (thisRoom.playersInGame[i].alliance === 'Spy') {
    //                 if (thisRoom.playersInGame[i].role === 'Oberon') {
    //                     // don't add oberon
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

export default Morgana;
