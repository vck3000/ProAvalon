const { players } = require("..//entities/Players");
const { leader } = require("..//components/leader");


playersList = []
nextLeader = getNextLeader(playersList)

// loctate the current player who's leader
function getCurrentLeader(playersList){

    for (let i = 0; i < playersList.length(); i++) {

        if (playersList[i].getComponent(leader) != null) {
            return playersList[i]
        }

    }

}

function getNextLeader(playersList, noLeaderlist) {

    tempList = noLeaderlist
    const nextLeader = tempList.pop();
    const currentLeader = getCurrentLeader(playersList)

    // switch leader in two players
    currentLeader.removeComponent(leader)
    nextLeader.addComponent(leader)

    // return the players list who haven't play leader yet
    if (tempList.length() ! = 0) {
        return tempList
    }
    
    else {
        return playersList
    }

  }