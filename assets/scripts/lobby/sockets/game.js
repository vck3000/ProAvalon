socket.on("update-room-players", function (data) {
    //if an extra person joins the game, play the chime

    console.log("update room players");

    // showDangerAlert("Test");
    oldData = roomPlayersData;
    // var x = $("#typehead").parent().width();    
    roomPlayersData = data;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

  // console.log("update room players");
    // console.log(data);

    // update spectators list
    // updateSpectatorsList();
    draw();

    if(oldData && oldData.length < roomPlayersData.length && roomPlayersData.length > 1){
        if($("#option_notifications_sound_players_joining_game")[0].checked === true){
            playSound('ding');
        }
        
        if($("#option_notifications_desktop_players_joining_game")[0].checked === true){
            displayNotification("New player in game!  [" + (roomPlayersData.length) + "p]", roomPlayersData[roomPlayersData.length - 1].username + " has joined the game!", "avatars/base-res.png", "newPlayerInGame");
        }
    }

});

socket.on("update-room-spectators", function(spectatorUsernames){
    $("#spectators-table tbody tr td").remove();
    $("#spectators-table tbody tr").remove();

    //append each player into the list
    spectatorUsernames.forEach(function (spectator) {

        //if the current game exists, add it
        if (spectator) {
            var str = "<tr> <td> " + spectator + "</td> </tr>";
            $("#spectators-table tbody").append(str);
        }
    });


    //remove the ugly remaining border when no spectators are there to display
    if (document.querySelectorAll("#spectators-table tbody tr td").length === 0) {
        document.querySelectorAll("#spectators-table")[0].classList.add("spectators-table-off");
        document.querySelectorAll("#spectators-table")[0].classList.remove("spectators-table-on");

        document.querySelectorAll("#spectators-table")[1].classList.add("spectators-table-off");
        document.querySelectorAll("#spectators-table")[1].classList.remove("spectators-table-on");
    }
    else {
        document.querySelectorAll("#spectators-table")[0].classList.add("spectators-table-on");
        document.querySelectorAll("#spectators-table")[0].classList.remove("spectators-table-off");

        document.querySelectorAll("#spectators-table")[1].classList.add("spectators-table-on");
        document.querySelectorAll("#spectators-table")[1].classList.remove("spectators-table-off");
    }
});



    //spectator join notifications
    //todo******************************************************
    //todo******************************************************

    //if an extra person joins the room
    // if(roomSpectatorsData && roomSpectatorsData.length < data.spectators.length){
    //     if($("#option_notifications_sound_players_joining_room")[0].checked === true){
    //         playSound('highDing');
    //     }

    //     if($("#option_notifications_desktop_players_joining_room")[0].checked === true && data.spectators[data.spectators.length - 1] !== ownUsername){
    //         displayNotification("New player in room.", data.spectators[data.spectators.length - 1] + " has joined the room.", "avatars/base-res.png", "newPlayerInRoom");
    //     }
    // }

//======================================
//GAME SOCKET ROUTES
//======================================
socket.on("game-starting", function (roles) {
    var secondsLeft = 10;
    let timerInterval;

    Swal({
        title: "Game is starting!",
        html: "<strong></strong> seconds left. <br><br>Roles are: " + roles,
        type: "info",
        confirmButtonText: "Ready",
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "Not ready",
        allowOutsideClick: false,
        allowEnterKey: false,
        reverseButtons: true,
        
        timer: 11000,

        onOpen: () => {
            // swal.showLoading()
            timerInterval = setInterval(() => {
              swal.getContent().querySelector('strong')
                .textContent = Math.floor(swal.getTimerLeft()/1000)
            }, 100)
          },
          onClose: () => {
            clearInterval(timerInterval)
          }

    }).then(function (result) {
        console.log(result)
        if (result.dismiss === swal.DismissReason.timer || result.dismiss === swal.DismissReason.cancel) {
            console.log('I was closed by the timer')
            socket.emit("player-not-ready", ownUsername);
          }
          else{
            console.log('Im ready!')
            socket.emit("player-ready", ownUsername);
          }
    });

    if($("#option_notifications_sound_game_starting")[0].checked === true){
        playSound("dingDingDing");
    }

    if($("#option_notifications_desktop_game_starting")[0].checked === true){
        displayNotification("Game starting!", "Are you ready?", "avatars/base-spy.png", "gameStarting");
    }
    
});

socket.on("spec-game-starting", function(data){
    Swal({
        title:"A game is starting!",
        text: "You cannot join the game unless someone is not ready.",
        type: "info",
        allowEnterKey: false
    });

    // document.querySelector("#green-button").classList.contains("disabled")

    $("#green-button").addClass("disabled");
});

socket.on("spec-game-starting-finished", function(data){
    $("#green-button").removeClass("disabled");
});


socket.on("game-data", function (data) {
    console.log("GAME DATA INC");   
    console.log(data);
    if (data && roomId === data.roomId) {
      // console.log("game starting!");

        // console.log(data);
        gameData = data;

        //if the game has only just started for the first time, display your role
        if(gameStarted === false){
            if(gameData.alliance){
                var str = "You are a " + gameData.alliance + ". Your role is " + gameData.role + ".";
                data = {
                    classStr: "server-text",
                    message: str
                }
                addToRoomChat(data);
            }

            if($("#option_notifications_sound_game_starting")[0].checked === true){
                // playSound("game-start");
            }
        }

        gameStarted = true;

        //hide the options cog
        document.querySelector("#options-button").classList.add("hidden");
        //remove the kick modal from redbutton
        $("#red-button").removeAttr("data-target");
        $("#red-button").removeAttr("data-toggle");

        isSpectator = gameData.spectator;

        drawVoteHistory(gameData);
        draw();
    }
});

socket.on("lady-info", function (message) {
    var str = message + " (this message is only shown to you)";
    var data = { message: str, classStr: "special-text noselect" };

    addToRoomChat(data);
});