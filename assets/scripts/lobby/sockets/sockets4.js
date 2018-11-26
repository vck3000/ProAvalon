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
    // console.log("Add to room chat");
    // console.log(data);
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
        docCookies.setItem("lastSettingsResetDate", new Date().toString(), Infinity);
    }
});

socket.on('checkNewUpdate', function(serverLastUpdateDate){
    serverLastUpdateDate = new Date(serverLastUpdateDate);
  // console.log("check reset date");

  // console.log(docCookies.hasItem("lastUpdateNotificationDate"));

    //check if we need to reset settings
    if(docCookies.hasItem("lastUpdateNotificationDate")){
        var lastDate = new Date(docCookies.getItem("lastUpdateNotificationDate"));

      // console.log(serverLastUpdateDate);
      // console.log(lastDate);

      // console.log(serverLastUpdateDate > lastDate);

        if(serverLastUpdateDate > lastDate){
            Swal({
                title: "New updates!",
                html: "There were some new updates! Check it out in the logs!",
                type: "info",
                allowEnterKey: false
            });
        }

        docCookies.setItem("lastUpdateNotificationDate", new Date().toString(), Infinity);
    }
    else{

        Swal({
            title: "New updates!",
            html: "There were some new updates! Check it out in the logs!",
            type: "info",
            allowEnterKey: false
        });
        
        docCookies.setItem("lastUpdateNotificationDate", new Date().toString(), Infinity);
    }
});

socket.on('checkNewPlayerShowIntro', function(){

    if(docCookies.hasItem("seenNewPlayerIntro")){

    }
    else{
        Swal({
            title: "Welcome!",
            html: "Welcome to ProAvalon! Here we play The Resistance: Avalon in a much more different way than you’d play with your family or friends. Please check the forums to acquaint yourself with the various strategies that we use while playing this game online.",
            type: "success",
            allowEnterKey: false
        });
        
        docCookies.setItem("seenNewPlayerIntro", new Date().toString(), Infinity);
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
        <li>In order for me to update the site, the server must be restarted in a few seconds. </li>

        <li>Any running games will be saved and you will be able to continue your games when you log in again.</li>

        <li>The server will only be down for a brief moment, at most 30 seconds.</li>

        <li>I apologise for the inconvenience caused. Thank you.</li>
    </ul>
    
    </div>`;

    Swal({
        title: "Server restarting soon!",
        html: message,
        type: "info",
        allowEnterKey: false




    }).then(() =>{
        // location.reload();
    });
});

socket.on("serverRestartingNow", function(){

    Swal({
        title: "Server restarting now",
        text: "The server is restarting now either due to an update, or for its daily restart.",
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

var currentOnlinePlayers;
socket.on("update-current-players-list", function (currentPlayers) {
    // console.log("update the current player list request received");
    // console.log(currentPlayers);
    //remove all the li's inside the table
    $("#current-players-table tbody tr td").remove();
    $("#current-players-table tbody tr").remove();

    // currentOnlinePlayers = currentPlayers;
    autoCompleteStrs = currentPlayers;

    //append each player into the list
    currentPlayers.forEach(function (currentPlayer) {

        //if the current game exists, add it
        if (currentPlayer) {
            var str = "<tr> <td> " + currentPlayer + "</td> </tr>";
            $("#current-players-table tbody").append(str);
        }
    });
    $(".player-count").text(currentPlayers.length);
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
            var lockStr = "";
            if(currentGame.passwordLocked === true){
                lockStr = " <span class='glyphicon glyphicon-lock'></span>";
            }
            // console.log("lock str: " + lockStr);

            
            if(currentGame.missionHistory){
                var missionHistoryStr = "<span style='white-space:nowrap; display: inline-block;'>";
                var fontSize = docCookies.getItem("optionDisplayFontSize") + "px";

                currentGame.missionHistory.forEach(function(hist){
                    if(hist === "succeeded"){
                        missionHistoryStr += "<span class='missionBoxSucceed lobbyMissionBox' style='height: " + fontSize + "; width: " + fontSize + ";'></span>";                    
                    }
                    else{
                        missionHistoryStr += "<span class='missionBoxFail lobbyMissionBox' style='height: " + fontSize + "; width: " + fontSize + ";'></span>";                    
                    }
                });
                for(var i = 0; i < 5 - currentGame.missionHistory.length; i++){
                    missionHistoryStr += "<span class='missionBoxDefault lobbyMissionBox' style='height: " + fontSize + "; width: " + fontSize + ";'></span>";                    
                }
    
                missionHistoryStr += "</span>";
            }
            else{
                var missionHistoryStr = "";
            }
            

            var str = "<tr> <td><strong>Room#" + 
                currentGame.roomId + lockStr + "</strong>: " + 
                currentGame.status + " [" + currentGame.numOfPlayersInside +  "/" + currentGame.maxNumPlayers + "]" + 
                "<hr>"+ 
                "Spectators: " + currentGame.numOfSpectatorsInside + 
                "<br>Host: " + currentGame.hostUsername + 
                "<br>" + missionHistoryStr +
                "</td> </tr>";

           
           
           
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

                setTimeout(function(){
                    $(".room-chat-list").html("");                      
                    checkMessageForCommands("/roomchat", "roomChat");
                }, 500);
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
  
socket.on("auto-join-room-id", function (roomId_, newRoomPassword) {
    // console.log("newRoomPassword: " + newRoomPassword);
    // console.log("auto join room");
    //received a request from server to auto join
    //likely we were the one who created the room
    //so we auto join into it
    socket.emit("join-room", roomId_, newRoomPassword);
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


socket.on("update-room-players", function (data) {
    //if an extra person joins the game, play the chime

    // console.log("update room players");

    // showDangerAlert("Test");
    oldData = roomPlayersData;
    // var x = $("#typehead").parent().width();    
    roomPlayersData = data;

    //remove all the li's inside the list
    // $("#mainRoomBox div").remove();

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

var oldSpectators = [];
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

    var newUsernameIndex = -1;
    // console.log(oldSpectators);
    // console.log(spectatorUsernames);

    for(var i = 0; i < oldSpectators.length; i++){
        if(oldSpectators.indexOf(spectatorUsernames[i]) === -1){
            newUsernameIndex = i;
        }
    }
    if(newUsernameIndex === -1){
        newUsernameIndex = spectatorUsernames.length - 1;
    }

    // console.log("new player: " + spectatorUsernames[newUsernameIndex]);

    // if an extra person joins the room
    if(spectatorUsernames && oldSpectators.length < spectatorUsernames.length && spectatorUsernames[newUsernameIndex] !== ownUsername){
        if($("#option_notifications_sound_players_joining_room")[0].checked === true){
            playSound('highDing');
        }

        if($("#option_notifications_desktop_players_joining_room")[0].checked === true && oldSpectators.length < spectatorUsernames.length && spectatorUsernames.indexOf(ownUsername) === -1){
            displayNotification("New player in room.", spectatorUsernames[newUsernameIndex] + " has joined the room.", "avatars/base-res.png", "newPlayerInRoom");
        }
    }
    oldSpectators = spectatorUsernames;

});


socket.on("joinPassword", function(roomId){


    (async function getEmail () {
        const {value: inputPassword} = await swal({
            title: "Type in the room password",
            type: "info",
            input: 'text',
            allowEnterKey: true,
            showCancelButton: true,
        });
        
        if (inputPassword) {
            // swal('Entered password: ' + inputPassword);
            socket.emit("join-room", roomId, inputPassword);
        }
        else{
            changeView();
        }
        })();

});

socket.on("changeView", function(targetLocation){
    changeView();
});

socket.on("wrongRoomPassword", function(){
    swal({
        title: "Incorrect password",
        type: "warning",
        allowEnterKey: true,
    });
});

socket.on("correctRoomPassword", function(){
    //call roomchat
    setTimeout(function(){
        $(".room-chat-list").html("");                      
        checkMessageForCommands("/roomchat", "roomChat");
    }, 500);
});

//this part at the moment only updates the max number of players in a game.
socket.on("update-room-info", function(data){
    // data.maxNumPlayers
    $(".gameInfoMaxPlayers")[0].innerText = roomPlayersData.length + "/" + data.maxNumPlayers;
    //if a game has started
    if(gameData){
        $(".gameInfoMaxPlayers").addClass("hidden");
    }
    else{
        $(".gameInfoMaxPlayers").removeClass("hidden");        
    }
});

// Update the new room menu with the gameModes available.
socket.on("gameModes", function(gameModeNames){
    // <option value="avalon">Avalon</option>
    // <option value="hunter">Hunter</option>

    var str = "";

    gameModeNames.forEach(function(name){
        str += "<option value='" + name + "'>" + name[0].toUpperCase() + name.slice(1, name.length) + "</option>";
    })

    $(".gameModeSelect")[0].innerHTML = str;
    $(".gameModeSelect")[1].innerHTML = str;
});

// Update the role and card settings inside the room (cog).
var defaultActiveRoles = ["Merlin", "Assassin", "Percival", "Morgana"];
var skipRoles = ["Resistance", "Spy"];

socket.on("update-game-modes-in-room", function(gameModeObj){
    var str = "";

    var count = 0;
    
    // Roles
    for(var i = 0; i < gameModeObj.roles.roleNames.length; i++){
        var name = gameModeObj.roles.roleNames[i];
        // Skip over certain roles since they are enabled by default
        if(skipRoles.includes(name) === true){
            continue;
        }

        var active;
        if(defaultActiveRoles.includes(name) === true){
            active = "active";
        }
        else{
            active = "";
        }

        str += "<label class='btn btn-mine " + active + "'>";
        str += "<input style='display: none;' name='" + name.toLowerCase() + "' id='" + name.toLowerCase() + "' type='checkbox' autocomplete='off' checked> " + name;
        str += "</label>";
        str += "<br>";
    }

    // Cards
    for(var i = 0; i < gameModeObj.cards.cardNames.length; i++){
        var name = gameModeObj.cards.cardNames[i];

        str += "<label class='btn btn-mine'>";
        str += "<input style='display: none;' name='" + name.toLowerCase() + "' id='" + name.toLowerCase() + "' type='checkbox' autocomplete='off' checked> " + name;
        str += "</label>";
        str += "<br>";
    }
    // Set it in
    $("#rolesCardsButtonGroup")[0].innerHTML = str;

    // Reset, now do descriptions
    // Roles
    str = "";
    for(var i = 0; i < gameModeObj.roles.roleNames.length; i++){
        var name = gameModeObj.roles.roleNames[i];
        //Skip over certain roles since they are enabled by default
        if(skipRoles.includes(name) === true){
            continue;
        }

        var greenOrRed;
        if(gameModeObj.roles.alliances[i] === "Resistance"){
            greenOrRed = "success";
        }
        else if(gameModeObj.roles.alliances[i] === "Spy"){
            greenOrRed = "danger";
        }
        else{
            greenOrRed = "";
        }

        str += `<div class="panel panel-${greenOrRed} roleCardDescription">
            <div class="panel-heading roleCardDescription" role="tab" id="heading${count}">
            <h4 class="panel-title">
            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#rolesCardsButtonGroupDescription" href="#collapse-cardRole${count}" aria-expanded="false" aria-controls="collapse-cardRole${count}">
                ${gameModeObj.roles.alliances[i]}
            </a>
            </h4>
            </div>
            <div id="collapse-cardRole${count}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${count}">
            <div class="panel-body">
                ${gameModeObj.roles.descriptions[i]}
            </div>
            </div>
            </div>`;

        // str += "<span class='roleCardDescription'>";
        // str += gameModeObj.roles.descriptions[i];
        // str += "</span>";

        str += "<br>";
        count += 1;
    }
    // Cards
    for(var i = 0; i < gameModeObj.cards.cardNames.length; i++){
        var name = gameModeObj.cards.cardNames[i];

        str += `<div class="panel panel-default roleCardDescription">
        <div class="panel-heading roleCardDescription" role="tab" id="heading${count}">
        <h4 class="panel-title">
        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#rolesCardsButtonGroupDescription" href="#collapse-cardRole${count}" aria-expanded="false" aria-controls="collapse-cardRole${count}">
            Card
        </a>
        </h4>
        </div>
        <div id="collapse-cardRole${count}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${count}">
        <div class="panel-body">
            ${gameModeObj.cards.descriptions[i]}
        </div>
        </div>
        </div>`;

        str += "<br>";
        
        count += 1;
    }
    // Set it in
    $("#rolesCardsButtonGroupDescription")[0].innerHTML = str;
});


$(".maxNumPlayers").on("change", function(e){
    // console.log("Change");
    // console.log(e.target.value);

    $($(".maxNumPlayers")[0]).val(e.target.value);
    $($(".maxNumPlayers")[1]).val(e.target.value);

    socket.emit("update-room-max-players", e.target.value);
});

$(".gameModeSelect").on("change", function(e){
    // console.log("Change");
    // console.log(e.target.value);

    
    $($(".gameModeSelect")[0]).val(e.target.value);
    $($(".gameModeSelect")[1]).val(e.target.value);

    socket.emit("update-room-game-mode", e.target.value);
});

// Update the new room menu with the gameModes available.
socket.on("leave-room-requested", function(){
    leaveRoom();
});