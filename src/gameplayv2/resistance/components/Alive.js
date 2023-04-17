import { roleComponent } from './components/RoleComponent';


// a simple tag component
class Alive extends roleComponent{
    constructor () {
        // this.entityID = entityID
        super("Alive")
        this.isAlive = true
    }
}