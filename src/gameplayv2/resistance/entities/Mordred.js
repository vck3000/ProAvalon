import { alliance } from '../components/alliance'
import { world } from '../system'
class Mordred extends Spy {

    constructor() {
        this.id = Entity.getNextID();
        this.components = [];
        this.addComponent(new AllianceComponent("Spy"));
        this.addComponent(new RoleComponent("Mordred"));
        this.addComponent(new DescriptionComponent("Mordred: Head of spy and merlin cannot see"));
        this.addComponent(createSeeComponent());
    }
    createSeeComponent() {
        // First null is becasue during view section it cannot see anyone special
        //Second  null is because no one with special ability can see him
        // so this see component is not enabled
        const see = new SeeComponent(null, null, false);
        return see
    }




}

export default Mordred;
