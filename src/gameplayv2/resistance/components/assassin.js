import { roleComponent } from './components/RoleComponent';
import { action } from './componets/SeeComponent'

// a simple tag component
class Assassin extends roleComponent{
    constructor () {

        super("Assassin")
        this.isAssassin = true
        
        this.test = function () {
            console.log(
              `Hi from Assassin`,
            );
          };
       
    }


}


