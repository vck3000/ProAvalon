





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
        playSound("game-start-ready");
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
                    classStr: "server-text noselect",
                    message: str,
                    dateCreated: new Date()
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