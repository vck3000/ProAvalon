const { players } = require("..//entities/Players");
const { leader } = require("..//components/leader");


playersList = []
nextLeader = getNextLeader(playersList)

// nextLeader.addComponent

// loctate the current player who's leader
function getCurrentLeader(playersList){

    for (let i = 0; i < playersList.length(); i++) {

        if (playersList[i].getComponent(leader) != null) {
            return playersList[i]
        }

    }

}

function getNextLeader(playersList) {

    const nextLeader = playersList.pop();
    const currentLeader = getCurrentLeader(playersList)

    // switch leader in two players
    currentLeader.removeComponent(leader)
    nextLeader.addComponent(leader)

  }