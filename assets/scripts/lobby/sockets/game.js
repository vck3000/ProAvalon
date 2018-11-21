





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
        // console.log(result)
        if (result.dismiss === swal.DismissReason.timer || result.dismiss === swal.DismissReason.cancel) {
            // console.log('I was closed by the timer')
            socket.emit("player-not-ready", ownUsername);
          }
          else{
            // console.log('Im ready!')
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

    // document.querySelector("#green-button").classList.contains("hidden")

    $("#green-button").addClass("hidden");
});

socket.on("spec-game-starting-finished", function(data){
    $("#green-button").removeClass("hidden");
});


socket.on("game-data", function (data) {
    // console.log("GAME DATA INC");   
    // console.log(data);
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



hoverMissionBoxHighlightPlayerSetup();
function hoverMissionBoxHighlightPlayerSetup(){

    $(".missionBox").hover(
    // Upon hover:
    function(){
        // console.log(this);
        // console.log(this.getAttribute("id"));
        // console.log(this.getAttribute("id").slice(-1));

        var missionNum = this.getAttribute("id").slice(-1);
        // Grab players to highlight
        var participatingTeamHighlight = getPlayersOnMission(parseInt(missionNum));

        // console.log("Participating members:");
        // console.log(participatingTeamHighlight);

        var darkThemeBool = docCookies.getItem("optionDisplayDarkTheme") === "true"

        // For the players on the team
        participatingTeamHighlight.forEach(function(username){
            if (darkThemeBool) {
                $('[usernameofplayer="' + username + '"]').addClass("highlight-participating-dark");
            }
            else{
                $('[usernameofplayer="' + username + '"]').addClass("highlight-participating");
                $(this).css("background-color", "rgba(255, 255, 0, 1)");
            }
        });
        
        // For the missionBox itself
        if (darkThemeBool) {
            $(this).css("background-color", "rgba(255, 255, 0, 0.65)");
            // Finished missions default have opacity set to 0.65 so ignore this temporarily
            $(this).css("opacity", "1");
        }
        else{
            $(this).css("background-color", "rgba(255, 255, 0, 1)");
        }
        
        // Set font colour to black so we can see the text when the box is yellow
        $(this).css("color", "black");
    },
    // Upon unhover:
    function(){
        // Reset all the displays for this function
        $(".playerDiv").removeClass("highlight-participating");
        $(".playerDiv").removeClass("highlight-participating-dark");
        $(".playerDiv").css("opacity", "");

        $(this).css("background-color", "");
        $(this).css("color", "");
        $(this).css("opacity", "");
    });
}

function getPlayersOnMission(missionNum){
    // If we haven't played enough missions dont highlight anything
    if(missionNum > gameData.missionHistory.length - 1){
        return [];
    } else{
        var team = [];
        // For each player:
        for(var key in gameData.voteHistory){
            if(gameData.voteHistory.hasOwnProperty(key) === true){
                // console.log(key);
                // Get the length of the mission (how many picks in the mission because we grab the last pick)
                var missionLen = gameData.voteHistory[key][missionNum].length;
                // console.log("a: " + missionLen);
        
                // If the user was picked, add to the list
                if(gameData.voteHistory[key][missionNum][missionLen-1].includes("VHpicked") === true){
                    team.push(key);
                }
            }
        }

        return team;
    }
}

