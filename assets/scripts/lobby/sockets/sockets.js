//======================================
//SOCKET ROUTES
//======================================
socket.on("username", function (username) {
    // ownUsername = username;
});

socket.on("allChatToClient", function (data) {
    addToAllChat(data);
});

socket.on("roomChatToClient", function (data) {
    addToRoomChat(data);
});

socket.on("joinedGameSuccess", function(data){
    isSpectator = false;
});

socket.on('disconnect', function(){
    // window.location= "/";
    // alert("You have been disconnected!");
    showDangerAlert("You have been disconnected! Please refresh the page.");
    socket.disconnect();
});

var mutedPlayers = [];
socket.on('updateMutedPlayers', function(data){
    mutedPlayers = data;
    // console.log("Muted players: ");
    // console.log(mutedPlayers);
});


socket.on('checkSettingsResetDate', function(serverResetDate){
    serverResetDate = new Date(serverResetDate);
  // console.log("check reset date");

  // console.log(docCookies.hasItem("lastSettingsResetDate"));

    //check if we need to reset settings
    if(docCookies.hasItem("lastSettingsResetDate")){
        var lastDate = new Date(docCookies.getItem("lastSettingsResetDate"));

      // console.log(serverResetDate);
      // console.log(lastDate);

      // console.log(serverResetDate > lastDate);

        if(serverResetDate > lastDate){
            resetSettings();
        }
    }
    else{
        // resetSettings();
    }
});

socket.on("serverRestartWarning", function(){
    var message = `<div style='text-align: left;'>
    <style>
        #swalUl li{
            padding-bottom: 3%;
        }

    </style>
    <ul id="swalUl">
        <li>In order for me to update the site, the server must be restarted. </li>

        <li>Any running games will be saved and you will be able to continue your games when you log in again.</li>

        <li>The server will only be down for a brief moment, at most 30 seconds.</li>

        <li>When you rejoin please use /roomChat to recover your chat.</li>

        <li>I apologise for the inconvenience caused. Thank you.</li>
    </ul>
    
    </div>`;

    Swal({
        title: "Server restarting!",
        html: message,
        type: "warning",
        allowEnterKey: false




    }).then(() =>{
        // location.reload();
    });
});

socket.on("refresh", function (data) {
    location.reload();
});

socket.on("muteNotification", function (modAction) {
    var message = `You will not be allowed to talk. You will not be allowed to play.<br><br>

    You are allowed to spectate games, use the forums and check out profiles. <br><br>

    Your mute will be released on ` + new Date(modAction.whenRelease) + `. <br><br>
    
    The description of your ban is: ` + modAction.descriptionByMod

    + `<br><br>
    
    You can exit this message by pressing escape.`;


    Swal({
        title: "You have been muted.",
        html: message,
        type: "warning",
        // buttons: false,
        
        allowEnterKey: false

    }).then(() =>{
        // location.reload();
    });
});

function resetSettings(){
    Swal({
        title: "New updates!",
        html: "Due to some new updates, a reset of your personal settings is required.<br><br>I apologise for the inconvenience caused :(.",
        type: "warning",
        allowEnterKey: false
    }).then(() =>{
        //get all the keys
        var keys = docCookies.keys();
                                    
        //remove each item
        for(var i = 0; i < keys.length; i++){
            docCookies.removeItem(keys[i]);
        }
        docCookies.setItem("lastSettingsResetDate", new Date().toString(), Infinity);

        Swal({
            title: "Poof! Your settings have been reset!",
            type: "success",
        }).then(() =>{
            //reload
            location.reload();
        });
    });
}

socket.on("gameEnded", function (data) {
    if($("#option_notifications_sound_game_ending")[0].checked === true){
        playSound("game-end");
    }
    
    if($("#option_notifications_desktop_game_ending")[0].checked === true){
        displayNotification("Game has ended!", "", "avatars/base-spy.png", "gameEnded");
    }
});

socket.on("openModModal", function (data) {
    $("#modModal").modal("show");
});


socket.on("update-current-players-list", function (currentPlayers) {
    // console.log("update the current player list request received");
      // console.log(currentPlayers);
      //remove all the li's inside the table
      $("#current-players-table tbody tr td").remove();
      $("#current-players-table tbody tr").remove();
  
      //append each player into the list
      currentPlayers.forEach(function (currentPlayer) {
  
          //if the current game exists, add it
          if (currentPlayer) {
              var str = "<tr> <td> " + currentPlayer + "</td> </tr>";
              $("#current-players-table tbody").append(str);
          }
      });
  });
  
  socket.on("update-current-games-list", function (currentGames) {
      // console.log(currentGames);
      //remove all the entries inside the table:
      $("#current-games-table tbody tr td").remove();
      $("#current-games-table tbody tr").remove();
  
      //append each game to the list
      currentGames.forEach(function (currentGame) {
          //if the current game exists, add it
          if (currentGame) {
              var str = "<tr> <td> " + currentGame.roomId + ": " + currentGame.status + " " + currentGame.numOfPlayersInside + "/10 <span style='padding-left: 10px;'>Spec: " + currentGame.numOfSpectatorsInside + "</span><p>Host: " + currentGame.hostUsername + "</p>" + "</td> </tr>";
              $("#current-games-table tbody").append(str);
  
  
              //grab all the td's and then add an event listener
              var allTds = document.querySelectorAll("#current-games-table tbody tr td");
  
              //add the event listener to the last td added.
              allTds[allTds.length - 1].addEventListener("click", function () {
                  //JOIN THE ROOM
  
                // console.log("RESET GAME DATA ON JOIN ROOM");
                  resetAllGameData();
  
                  // console.log(currentGame.roomId);
                  socket.emit("join-room", currentGame.roomId);
                  //change the view to the room instead of lobby
                  roomId = currentGame.roomId;
                  //set the spectator to true
                  isSpectator = true;
                  //change to the game room view
                  changeView();
              });
          }
      });
  
      //remove the ugly remaining border when no games are there to display
      if (document.querySelectorAll("#current-games-table tbody tr td").length === 0) {
          document.querySelectorAll("#current-games-table")[0].classList.add("current-games-table-off");
          document.querySelectorAll("#current-games-table")[0].classList.remove("current-games-table-on");
  
      }
      else {
          document.querySelectorAll("#current-games-table")[0].classList.add("current-games-table-on");
          document.querySelectorAll("#current-games-table")[0].classList.remove("current-games-table-off");
      }
  });
  
  socket.on("auto-join-room-id", function (roomId_) {
    // console.log("auto join room");
      //received a request from server to auto join
      //likely we were the one who created the room
      //so we auto join into it
      socket.emit("join-room", roomId_);
      socket.emit("join-game", roomId_);
      isSpectator = false;
      roomId = roomId_;
      //chang ethe view to the room instead of lobby
      changeView();
  });
  
  

  socket.on("update-status-message", function (data) {
    if (data) {
        $("#status").textContent = data;
    }
});