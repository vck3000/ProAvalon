import { roleComponent } from './components/RoleComponent';


// a simple tag component
class leader extends roleComponent{
    constructor () {
        // this.entityID = entityID
        this.name = "Leader"
        this.isLearder = true
    }
}