//======================================
//BUTTON EVENT LISTENERS
//======================================
document.querySelector("#green-button").addEventListener("click", greenButtonFunction);
document.querySelector("#red-button").addEventListener("click", redButtonFunction);

//re-draw the game screen when the modal is closed to update the roles in the center well.
$('#roleOptionsModal').on('hidden.bs.modal', function (e) {
    draw();
    console.log("test");
})

// Set the event listener for the button
$("#kickButton")[0].addEventListener("click", function () {
    var players = getKickPlayers();

    //kick the selected players one by one
    for (var key in players) {
        if (players.hasOwnProperty(key)) {
            socket.emit("kickPlayer", key);
          // console.log("kick player: " + key);
        }
    }
});

//new ROOM CODE
document.querySelector("#newRoom").addEventListener("click", function () {
    if (inRoom === false) {
        socket.emit("newRoom");
      // console.log("RESET GAME DATA ON CREATE ROOM");
        resetAllGameData();
        inRoom = true;
    }
});

document.querySelector("#danger-alert-box-button").addEventListener("click", function () {

    if(document.querySelector("#danger-alert-box").classList.contains("disconnect")){

    }
    else{
        document.querySelector("#danger-alert-box").classList.add("inactive-window");
        document.querySelector("#danger-alert-box-button").classList.add("inactive-window");
    }
    
});

document.querySelector("#success-alert-box-button").addEventListener("click", function () {
    document.querySelector("#success-alert-box").classList.add("inactive-window");
    document.querySelector("#success-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#backButton").addEventListener("click", function () {
    changeView();
    socket.emit("leave-room", "");

    console.log("LEAVE");
    resetAllGameData();
});

document.querySelector("#claimButton").addEventListener("click", function () {
    //INCOMPLETE
    socket.emit("claim", "");

    if($("#claimButton")[0].innerText === "Claim"){
        $("#claimButton")[0].innerText = "Unclaim";
    }
    else{
        $("#claimButton")[0].innerText = "Claim";
    }
});