var socket = io({ transports: ['websocket'], upgrade: false });
// console.log("started");

//Prevents the window height from changing when android keyboard is pulled up.
setTimeout(function () {
    let viewheight = $(window).height();
    let viewwidth = $(window).width();
    let viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", "height=" + viewheight + ", width=" + viewwidth + ", initial-scale=1.0");



    // Extend divs to bottom of page:
    // All chat in lobby
    var parentH = $("#col1")[0].offsetHeight;
    var textH = $("#all-chat-lobby-text")[0].offsetHeight;
    var inputH = $(".all-chat-message-input")[0].offsetHeight;
    var newHeight = parentH - textH - inputH;
    $("#all-chat-lobby")[0].style.height = (newHeight - 10) + "px";
}, 300);


$("#option_dark_theme")[0].addEventListener("click", function () {
    var checked = $("#option_dark_theme")[0].checked;
    console.log("dark theme change " + checked);
    //dark theme
    if (checked === true) {
        $("body")[0].classList.add("dark");
        $(".well").addClass("dark");
        $("input").addClass("dark");
        $("textarea").addClass("dark");
        $(".btn-default").addClass("btn-inverse");
        $(".navbar").addClass("navbar-inverse");
    }
    else {
        $("body")[0].classList.remove("dark");
        $(".well").removeClass("dark");
        $("input").removeClass("dark");
        $("textarea").removeClass("dark");
        $(".btn-default").removeClass("btn-inverse");
        $(".navbar").removeClass("navbar-inverse");
    }
});


//get the status of the checkbox for the gameplaytext
var option_font_size = $("#option_font_size")[0].checked;
var option_font_size_text = $("#option_font_size_text")[0];

var stringText = $("body").css("font-size");
stringText = stringText.slice(0, stringText.length - 2);
option_font_size_text.value = stringText;

if (option_font_size === true) {
    $("#option_font_size_text").on("change", function () {
        console.log(option_font_size_text.value);
        if (option_font_size_text.value > 5) {
            $("html *").css("font-size", option_font_size_text.value + "px");
        }
        else {
            $("html *").css("font-size", "5px");
        }
        draw(storeData);
    });
}







//for the game (like players in game)
var storeData;
var seeData;
var gameData;
var roomId;
var gameStarted = false;
var ownUsername = "";
var inRoom = false;

var isSpectator = false;

//window resize, repaint the users
window.addEventListener('resize', function () {
    console.log("Resized");
    draw(storeData);
});


//======================================
//BUTTON EVENT LISTENERS
//======================================
document.querySelector("#green-button").addEventListener("click", greenButtonFunction);
document.querySelector("#red-button").addEventListener("click", redButtonFunction);

//re-draw the game screen when the modal is closed to update the roles in the center well.
$('#optionsModal').on('hidden.bs.modal', function (e) {
    draw(storeData);
})

// Set the event listener for the button
$("#kickButton")[0].addEventListener("click", function(){
    var players = getKickPlayers();

    //kick the selected players one by one
    for(var key in players){
        if(players.hasOwnProperty(key)){
            socket.emit("kickPlayer", key);
            console.log("kick player: " + key);
        }
    }
});

//new ROOM CODE
document.querySelector("#newRoom").addEventListener("click", function () {
    if (inRoom === false) {
        socket.emit("newRoom");
        console.log("RESET GAME DATA ON CREATE ROOM");
        resetAllGameData();
        inRoom = true;
    }
});

document.querySelector("#danger-alert-box-button").addEventListener("click", function () {
    document.querySelector("#danger-alert-box").classList.add("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#success-alert-box-button").addEventListener("click", function () {
    document.querySelector("#success-alert-box").classList.add("inactive-window");
    document.querySelector("#success-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#backButton").addEventListener("click", function () {
    changeView();
    socket.emit("leave-room", "");

    resetAllGameData();
});



var allChatWindow1 = document.querySelectorAll(".all-chat-message-input")[0];
allChatWindow1.onkeyup = function (e, allChatWindow1) {
    //When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

var allChatWindow2 = document.querySelectorAll(".all-chat-message-input")[1];
allChatWindow2.onkeyup = function (e, allChatWindow2) {
    //When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

function addAllChatEventListeners(e, allChatWindow) {
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = allChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if (message && message.length > 0) {
            //append 0 in front of single digit minutes

            var date = d.getMinutes();

            // if(date < 10){date = "0" + date;}

            var data = {
                date: date,
                message: message
            }

            //reset the value of the textbox
            allChatWindow.value = "";

            //check message, if false then no command.
            if (checkMessageForCommands(message, "allChat") === true) {
                //do nothing, all will be done in function checkMessageForCommands.
            }
            else {
                //send data to the server 
                socket.emit("allChatFromClient", data);
            }
            scrollDown();
        }

    }
}

var roomChatWindow = document.querySelector(".room-chat-message-input");
roomChatWindow.onkeyup = function (e) {
    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = roomChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if (message && message.length > 0) {
            //append 0 in front of single digit minutes

            var date = d.getMinutes();
            // if(date < 10){date = "0" + date;}

            var data = {
                date: date,
                message: message,
                roomId: roomId
            }

            //reset the value of the textbox
            roomChatWindow.value = "";

            //check message, if false then no command.
            if (checkMessageForCommands(message, "roomChat") === true) {
                //do nothing, all will be done in function checkMessageForCommands.
            }
            else {
                //send data to the server 
                socket.emit("roomChatFromClient", data);
            }
            scrollDown();
        }
    }
}

//======================================
//SOCKET ROUTES
//======================================
socket.on("username", function (username) {
    ownUsername = username;
});

socket.on("allChatToClient", function (data) {
    addToAllChat(data);
});

socket.on("roomChatToClient", function (data) {
    addToRoomChat(data);
});



function addToAllChat(data, classStr) {
    //if it is a string, force it into a array
    if (typeof (data.message) === "string") {
        data.message = [data.message];
    }

    for (var i = 0; i < data.message.length; i++) {
        //format the date
        var d = new Date();
        var hour = d.getHours();
        if (hour < 10) { hour = "0" + hour; }
        if (data.date < 10) { data.date = "0" + data.date; }
        var date = "[" + hour + ":" + data.date + "]";

        //prevent XSS injection
        var filteredMessage = data.message[i].replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/, "&amp;nbsp;");

        var str = "";
        if (classStr && classStr !== "") {
            str = "<li class='" + classStr + "'>" + filteredMessage;
        }
        else {
            str = "<li class='" + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data.username + ":</span> " + filteredMessage;
        }

        $(".all-chat-list").append(str);
        scrollDown();

        //yellow notification on the tabs in room.
        if ($(".nav-tabs #all-chat-in-game-tab").hasClass("active") === false) {
            $(".nav-tabs #all-chat-in-game-tab").addClass("newMessage");
        }
    }

}

function addToRoomChat(data, classStr) {
    //if it is a string, force it into a array
    if (typeof (data.message) === "string") {
        data.message = [data.message];
    }

    for (var i = 0; i < data.message.length; i++) {
        //format the date
        var d = new Date();
        var hour = d.getHours();
        if (hour < 10) { hour = "0" + hour; }
        if (data.date < 10) { data.date = "0" + data.date; }
        var date = "[" + hour + ":" + data.date + "]";

        //prevent XSS injection
        if (data.message[i]) {
            var filteredMessage = data.message[i].replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/, "&amp;nbsp;");

            var str = "";

            //set the highlight chat if the user has been selected already
            var highlightChat = "";
            if (selectedChat[data.username] === true) {
                highlightChat = "selected-chat";
            }

            if (classStr && classStr !== "") {
                str = "<li class='" + classStr + " " + highlightChat + "'>" + filteredMessage;
            }
            else {
                str = "<li class='" + highlightChat + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data.username + ":</span> " + filteredMessage;
            }

            $(".room-chat-list").append(str);
            scrollDown();

            //yellow notification on the tabs in room.
            if ($(".nav-tabs #room-chat-in-game-tab").hasClass("active") === false) {
                $(".nav-tabs #room-chat-in-game-tab").addClass("newMessage");
            }
        }
    }
}

//Remove the new message yellow background colour when
//user selects the tab
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab
    // console.log(target);

    if (target === "#all-chat-in-game") {
        $(".nav-tabs #all-chat-in-game-tab").removeClass("newMessage")
    }
    else if (target === "#room-chat-in-game") {
        $(".nav-tabs #room-chat-in-game-tab").removeClass("newMessage")
    }
});







socket.on("player-joined-lobby", function (username) {
    var str = "<li class=server-text>" + username + " has joined the lobby.";
    $(".all-chat-list").append(str);
    scrollDown();
});

socket.on("player-left-lobby", function (username) {
    var str = "" + username + " has left the lobby.";
    var data = { message: str };

    addToAllChat(data, "server-text");
});

socket.on("player-joined-room", function (username) {
    var str = "" + username + " has joined the room.";
    var data = { message: str };

    addToRoomChat(data, "server-text");
});

socket.on("player-left-room", function (username) {
    var str = "" + username + " has left the room.";
    var data = { message: str };

    addToRoomChat(data, "server-text");
});

socket.on("update-current-players-list", function (currentPlayers) {
    console.log("update the current player list request received");
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


        // var str = "<li>" + currentPlayer + "</li>";
        // $("#current-players-list").append(str);
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
            var str = "<tr> <td> " + currentGame.roomId + ": " + currentGame.status + " " + currentGame.numOfPlayersInside + "/10" + "<p>Host: " + currentGame.hostUsername + "</p>" + "</td> </tr>";
            $("#current-games-table tbody").append(str);


            //grab all the td's and then add an event listener
            var allTds = document.querySelectorAll("#current-games-table tbody tr td");

            //add the event listener to the last td added.
            allTds[allTds.length - 1].addEventListener("click", function () {
                //JOIN THE ROOM

                console.log("RESET GAME DATA ON JOIN ROOM");
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






socket.on("new-game-created", function (str) {
    var str = "<li class=server-text>" + str + "</li>";
    $(".all-chat-list").append(str);
});

socket.on("auto-join-room-id", function (roomId_) {
    console.log("auto join room");
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



//==========================================
//COMMANDS
//==========================================
socket.on("commands", function (commands) {
    assignCommands(commands);
});

socket.on("messageCommandReturnStr", function (str) {
    var data = { message: str };

    if (lastChatBoxCommand === "allChat") {
        addToAllChat(data, "server-text");
    }
    else if (lastChatBoxCommand === "roomChat") {
        addToRoomChat(data, "server-text");
    }
    console.log("received return str");
});


var slap;
socket.on("slap", function (username) {

    if (slap === undefined) {
        slap = new Audio('sounds/slap.mp3');
    }

    slap.play();
    var data = { message: "You have just been slapped by " + username }

    setTimeout(function () {
        addToAllChat(data, "server-text");
        addToRoomChat(data, "server-text");
    }, 1100);
});

//======================================
//NOTIFICATIONS
//======================================
socket.on("alert", function (data) {
    alert(data);
    window.location.replace("/");
});

socket.on("success-alert", function (data) {
    showSuccessAlert(data);
});

socket.on("danger-alert", function (data) {
    showDangerAlert(data);
});

function showSuccessAlert(data) {
    document.querySelector("#success-alert-box").classList.remove("inactive-window");
    document.querySelector("#success-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#success-alert-box").textContent = data + "        |        Press here to remove";
}


function showDangerAlert(data) {
    document.querySelector("#danger-alert-box").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box").textContent = data + "        |        Press here to remove";
};




socket.on("update-room-players", function (data) {
    // var x = $("#typehead").parent().width();
    storeData = data;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

    console.log("update room players");
    // console.log(data);

    draw(data);
});

//======================================
//GAME SOCKET ROUTES
//======================================

socket.on("game-starting", function (roles) {
    var secondsLeft = 15;
    swal({
        title: "Game is starting in " + secondsLeft,
        text: "Roles are: " + roles,
        icon: "info",
        // button: "Ready!",
        buttons: ["Not ready", "Ready"]
    }).then(function (value) {
        // swal(("The returned value is: " + value));
        if (value === true) {
            socket.emit("player-ready", ownUsername);
        }
        else {
            socket.emit("player-not-ready", ownUsername);
        }
    });
});

socket.on("player-ready", function (str) {
    var data = { message: str }
    addToRoomChat(data, "server-text");
});

socket.on("player-not-ready", function (str) {
    var data = { message: str }
    addToRoomChat(data, "server-text");
});

socket.on("game-data", function (data) {
    // console.log("GAME DATA INC");   
    if (data) {
        console.log("game starting!");

        // console.log(data);
        gameData = data;

        gameStarted = true;

        //hide the options cog
        document.querySelector("#options-button").classList.add("hidden");
        //remove the kick modal from redbutton
        $("#red-button").removeAttr("data-target");
        $("#red-button").removeAttr("data-toggle");

        isSpectator = gameData.spectator;

        drawVoteHistory(gameData);
        draw(storeData);
    }
});

socket.on("lady-info", function (message) {
    var str = message + " (this message is only shown to you)";
    var data = { message: str };

    addToRoomChat(data, "special-text noselect");
});

socket.on("update-status-message", function (data) {
    if (data) {
        $("#status").textContent = data;
    }
});

//======================================
//FUNCTIONS
//======================================
socket.on("sendText", function (data) {
    addToRoomChat({ message: data.message }, data.stringType);
    // console.log("print new gameplay-text");
});

function redButtonFunction() {
    if (document.querySelector("#red-button").classList.contains("disabled") === false) {
        if (isSpectator === true) {

        }
        else if (gameStarted === false) {
            // Set the kick modal content
            var str = "<h4>Select the players you want to kick.</h4>";

            str += '<div class="btn-group-vertical" data-toggle="buttons">';

            for(var i = 0; i < storeData.length; i++){
                str += '<label class="btn btn-mine">';

                str += '<input name="' + storeData[i].username + '" id="' + storeData[i].username + '" type="checkbox" autocomplete="off">' + storeData[i].username;

                str += "</label>";
                str += "<br>";
            }

            str += '</div>';

            $("#kickModalContent")[0].innerHTML = str;
        }
        else {
            if (gameData.phase === "voting") {
                console.log("Voted reject");
                socket.emit("pickVote", "reject");
            }
            else if (gameData.phase === "missionVoting") {
                console.log("Voted fail");


                if (gameData.alliance === "Resistance") {
                    console.log("You aren't a spy! You cannot fail a mission!");
                    // socket.emit("missionVote", "succeed");
                    showDangerAlert("You are resistance. Surely you want to succeed!");
                } else {
                    socket.emit("missionVote", "fail");
                }

            }
        }
    }
}

function greenButtonFunction() {
    //if button is not disabled: 
    if (document.querySelector("#green-button").classList.contains("disabled") === false) {
        if (isSpectator === true) {
            socket.emit("join-game", roomId);
            isSpectator = false;
        }
        else if (gameStarted === false) {
            socket.emit("startGame", getOptions());
        }
        else {
            if (gameData.phase === "picking") {
                var arr = getHighlightedAvatars();
                console.log(arr);
                socket.emit("pickedTeam", arr);
            }
            else if (gameData.phase === "voting") {
                console.log("Voted approve");
                socket.emit("pickVote", "approve");
            }
            else if (gameData.phase === "missionVoting") {
                console.log("Voted succeed");
                socket.emit("missionVote", "succeed");
            }
            else if (gameData.phase === "assassination") {
                console.log("Assasinate!!!");
                socket.emit("assassinate", getHighlightedAvatars());
            }
            else if (gameData.phase === "lady") {
                console.log("Lady: " + getHighlightedAvatars()[0]);
                socket.emit("lady", getHighlightedAvatars()[0]);
            }

        }
    }
}


function draw() {
    console.log("draw called");
    if (storeData) {
        drawAndPositionAvatars();

        drawTeamLeaderStar();

        drawMiddleBoxes();

        activateAvatarButtons();


        if (gameStarted === true) {
            //default greyed out rn
            enableDisableButtons();

            //Edit the status bar/well
            if (gameData.phase === "picking") {
                //give it the default status message
                document.querySelector("#status").innerText = gameData.statusMessage;

                //draw the votes if there are any to show
                drawVotes(gameData.votes);

                //if we are the team leader---------------------------------------------
                if (getIndexFromUsername(ownUsername) === gameData.teamLeader) {
                    teamLeaderSetup(gameData.phase);
                }

            }
            else if (gameData.phase === "voting") {

                drawGuns();

                //show the remaining players who haven't voted
                var str = "Waiting for votes: ";

                for (var i = 0; i < gameData.playersYetToVote.length; i++) {
                    str = str + gameData.playersYetToVote[i] + ", ";
                }

                document.querySelector("#status").innerText = str;
            }

            else if (gameData.phase === "missionVoting") {
                //show the remaining players who haven't voted
                var str = "Waiting for mision votes: ";

                for (var i = 0; i < gameData.playersYetToVote.length; i++) {
                    str = str + gameData.playersYetToVote[i] + ", ";
                }

                document.querySelector("#status").innerText = str;

                drawGuns();
                drawVotes(gameData.votes);
            }
            else if (gameData.phase === "assassination") {
                //for the assassin: set up their stuff to shoot
                if (gameData.role === "Assassin") {
                    document.querySelector("#status").innerText = "Shoot the merlin.";
                    assassinationSetup(gameData.phase);
                }
                else {
                    document.querySelector("#status").innerText = "Waiting for the assassin to shoot.";
                }
                enableDisableButtons();
            }
            else if (gameData.phase === "lady") {
                document.querySelector("#status").innerText = gameData.statusMessage;
                if (ownUsername === getUsernameFromIndex(gameData.lady)) {
                    ladySetup(gameData.phase, gameData.ladyablePeople);
                }
                enableDisableButtons();
            }

            else if (gameData.phase === "finished") {
                document.querySelector("#status").innerText = gameData.statusMessage;
                enableDisableButtons();
                if (gameData.see.playerShot) {
                    drawBullet(getIndexFromUsername(gameData.see.playerShot));
                }


            }

        }

        else {
            //if we are the host
            if (ownUsername === getUsernameFromIndex(0)) {
                currentOptions = getOptions();
                var str = "";

                for (var key in currentOptions) {
                    if (currentOptions.hasOwnProperty(key)) {
                        if (currentOptions[key] === true) {
                            if (key === "merlinassassin") {
                                str += "Merlin, Assassin, ";
                            }
                            else if (key === "percival") {
                                str += "Percival, ";
                            }
                            else if (key === "morgana") {
                                str += "Morgana, ";
                            }
                            else if (key === "lady") {
                                str += "Lady of the Lake, ";
                            }
                            else if (key === "mordred") {
                                str += "Mordred, ";
                            }
                            else if (key === "oberon") {
                                str += "Oberon, ";
                            }
                            else {
                                str += "Error, unexpected option."
                            }
                        }
                    }
                }

                document.querySelector("#status").innerText = "Current roles: " + str;
            }
            else {
                document.querySelector("#status").innerText = "Waiting for game to start... ";
            }
            enableDisableButtons();
        }
    }
}

var selectedAvatars = {};
var numOfStatesOfHighlight = 2;
var selectedChat = {};
function activateAvatarButtons() {
    // console.log("activate avatar buttons");
    // console.log("LOL");
    // if(OPTION THING ADD HERE){
    var highlightButtons = document.querySelectorAll("#mainRoomBox div #highlightAvatarButton");
    //add the event listeners for button press
    for (var i = 0; i < highlightButtons.length; i++) {
        // console.log(i);

        highlightButtons[i].addEventListener("click", function () {
            // //toggle the highlight class
            // var divs = document.querySelectorAll("#mainRoomBox div");
            // var uniqueNum = i;
            console.log("click for highlight avatar");

            // this.parentElement.classList.toggle("selected-avatar");
            var username = this.parentElement.parentElement.getAttribute("usernameofplayer");
            // console.log("username: " + username);

            if (selectedAvatars[username] !== undefined) {
                selectedAvatars[username] += 1;
            }
            else {
                selectedAvatars[username] = 1;
            }

            selectedAvatars[username] = selectedAvatars[username] % (numOfStatesOfHighlight + 1);
            console.log("Selected avatars num: " + selectedAvatars[username])
            draw(storeData);
        });
    }



    var highlightChatButtons = document.querySelectorAll("#mainRoomBox div #highlightChatButton");
    //add the event listeners for button press
    for (var i = 0; i < highlightChatButtons.length; i++) {
        // console.log(i);

        highlightChatButtons[i].addEventListener("click", function () {
            // //toggle the highlight class
            // var divs = document.querySelectorAll("#mainRoomBox div");
            // var uniqueNum = i;
            console.log("click for highlight chat");

            // this.parentElement.classList.toggle("selected-avatar");

            var chatItems = $(".room-chat-list li");
            var username = this.parentElement.parentElement.getAttribute("usernameofplayer");

            if (selectedChat[username] === true) {
                selectedChat[username] = false;

                for (var i = 0; i < chatItems.length; i++) {
                    if (chatItems[i].classList.contains("selected-chat")) {
                        if (chatItems[i].childNodes[2].innerText === username + ":") {
                            chatItems[i].classList.remove("selected-chat");
                        }
                    }
                }
            }
            else {
                selectedChat[username] = true;

                console.log("add chat colour");

                for (var i = 0; i < chatItems.length; i++) {
                    if (chatItems[i].childNodes[2]) {
                        if (chatItems[i].childNodes[2].innerText === username + ":") {
                            chatItems[i].classList += " selected-chat";
                        }
                    }
                }
            }

            draw(storeData);
        });
    }


    // }
}



function drawBullet(indexOfPlayer) {

    //set the div string and add the star\\
    var str = $("#mainRoomBox div")[indexOfPlayer].innerHTML;
    str = str + "<span><img src='pictures/bullet.png' class='bullet'></span>";
    //update the str in the div
    $("#mainRoomBox div")[indexOfPlayer].innerHTML = str;

    // $(".bullet")[0].style.top = 0;

}

function drawVotes(votes) {
    var divs = document.querySelectorAll("#mainRoomBox div");

    if (votes) {
        for (var i = 0; i < divs.length; i++) {
            document.querySelectorAll("#mainRoomBox div")[i].classList.add(votes[i]);
        }
    }
    else {
        for (var i = 0; i < divs.length; i++) {
            document.querySelectorAll("#mainRoomBox div")[i].classList.remove("approve");
            document.querySelectorAll("#mainRoomBox div")[i].classList.remove("reject");
        }
    }
}


function assassinationSetup(phase) {
    if (phase === "assassination") {
        var divs = document.querySelectorAll("#mainRoomBox div");
        //add the event listeners for button press
        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function () {
                console.log("avatar pressed");
                //toggle the highlight class
                this.classList.toggle("highlight-avatar");
                //change the pick team button to enabled/disabled
                enableDisableButtons();
            });
        }
    }
}

function teamLeaderSetup(phase) {
    var numPlayersOnMission = gameData.numPlayersOnMission[gameData.missionNum - 1];

    //edit the well to show how many people to pick.
    if (phase === "picking") {

        document.querySelector("#status").innerText = "Your turn to pick a team. Pick " + numPlayersOnMission + " players.";

        var divs = document.querySelectorAll("#mainRoomBox div");
        //add the event listeners for button press
        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function () {
                console.log("avatar pressed");
                //toggle the highlight class
                this.classList.toggle("highlight-avatar");
                //change the pick team button to enabled/disabled
                enableDisableButtonsLeader(numPlayersOnMission);
            });
        }
    }
}

function ladySetup(phase, ladyablePeople) {
    //edit the well to show how many people to pick.
    if (phase === "lady") {

        document.querySelector("#status").innerText = "Your turn to use the Lady of the Lake. Select one player to use it on.";

        var divs = document.querySelectorAll("#mainRoomBox div");
        //add the event listeners for button press
        for (var i = 0; i < divs.length; i++) {
            if (ladyablePeople[i] === true) {
                divs[i].addEventListener("click", function () {
                    console.log("avatar pressed");
                    //toggle the highlight class
                    this.classList.toggle("highlight-avatar");
                    //change the pick team button to enabled/disabled
                    enableDisableButtons();
                });
            }
        }
    }
}

function drawMiddleBoxes() {
    //draw missions and numPick
    //j<5 because there are only 5 missions/picks each game
    if (gameData) {
        for (var j = 0; j < 5; j++) {
            //missions
            var missionStatus = gameData.missionHistory[j];
            if (missionStatus === "succeeded") {
                document.querySelectorAll(".missionBox")[j].classList.add("missionBoxSucceed");
                document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxFail");
            }
            else if (missionStatus === "failed") {
                document.querySelectorAll(".missionBox")[j].classList.add("missionBoxFail");
                document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxSucceed");
            }

            //draw in the number of players in each mission
            var numPlayersOnMission = gameData.numPlayersOnMission[j];
            if (numPlayersOnMission) {
                document.querySelectorAll(".missionBox")[j].innerHTML = "<p>" + numPlayersOnMission + "</p>";
            }

            //picks boxes
            var pickNum = gameData.pickNum;
            if (j < pickNum) {
                document.querySelectorAll(".pickBox")[j].classList.add("pickBoxFill");
            }
            else {
                document.querySelectorAll(".pickBox")[j].classList.remove("pickBoxFill");
            }
        }
    }
    else {
        for (var j = 0; j < 5; j++) {
            document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxFail");
            document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxSucceed");
            document.querySelectorAll(".missionBox")[j].innerText = "";
            document.querySelectorAll(".pickBox")[j].classList.remove("pickBoxFill");
        }
    }
}


function drawAndPositionAvatars() {
    var w = $("#mainRoomBox").width();
    var h = $("#mainRoomBox").height();

    var numPlayers = storeData.length;//3;

    //generate the divs in the html
    var str = "";
    console.log("Game started: " + gameStarted);
    if (gameStarted === true) {
        //draw the players according to what the client sees (their role sees)
        for (var i = 0; i < numPlayers; i++) {
            //check if the user is on the spy list. 
            //if they are not, they are res
            if (gameData.see.spies && gameData.see.spies.indexOf(storeData[i].username) === -1) {
                str = str + strOfAvatar(storeData[i], "res");
            }
            //else they are a spy
            else {
                str = str + strOfAvatar(storeData[i], "spy");
            }
        }
    }
    //when game has not yet started, everyone is a res image
    else {
        for (var i = 0; i < numPlayers; i++) {
            str = str + strOfAvatar(storeData[i], "res");
        }
    }

    //set the divs into the box
    $("#mainRoomBox").html(str);


    //===============================================
    //POSITIONING SECTION
    //===============================================

    //set the positions and sizes
    // console.log("numPlayers: " + numPlayers)
    var divs = document.querySelectorAll("#mainRoomBox div");
    var playerLocations = generatePlayerLocations(numPlayers, w / 2, h / 2);

    for (var i = 0; i < numPlayers; i++) {
        // console.log("player position: asdflaksdjf;lksjdf");
        var offsetX = w / 2;
        var offsetY = h / 2;

        var windowH = $(window).height();
        var windowW = $(window).width();

        var strX = playerLocations.x[i] + offsetX + "px";
        var strY = playerLocations.y[i] + offsetY - windowH * 0.01 + "px";

        divs[i].style.left = strX;
        divs[i].style.bottom = strY;

        var ratioXtoY = 0.8;

        divs[i].style.height = 40 + "%";
        divs[i].style.width = divs[i].offsetHeight * ratioXtoY + "px";

        // //size of the avatar img
        // divs[i].style.width = 30 + "%";
        // divs[i].style.height = 30 + "%";

        // //get which one is smaller, width or height and then
        // //force square
        // if(divs[i].offsetWidth < divs[i].offsetHeight){
        //     divs[i].style.height = divs[i].offsetWidth + "px";
        //     // console.log("width smaller, make height smaller to square");
        // } else{
        //     divs[i].style.width = divs[i].offsetHeight + "px";
        //     // console.log("height smaller, make width smaller to square");
        // }
    }
}

function drawGuns() {

    // gameData.propsedTeam
    for (var i = 0; i < gameData.proposedTeam.length; i++) {
        //set the div string and add the gun
        var str = $("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])].innerHTML;
        str = str + "<span><img src='pictures/gun.png' class='gun'></span>";
        //update the str in the div
        $("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])].innerHTML = str;
    }
}

function drawTeamLeaderStar() {
    var playerIndex;
    if (gameStarted === false) {
        playerIndex = 0;
    } else {
        playerIndex = gameData.teamLeader;
    }
    //set the div string and add the star
    if ($("#mainRoomBox div")[playerIndex]) {
        var str = $("#mainRoomBox div")[playerIndex].innerHTML;
        str = str + "<span><img src='pictures/leader.png' class='leaderStar'></span>";
        //update the str in the div
        $("#mainRoomBox div")[playerIndex].innerHTML = str;

        $(".leaderStar")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
    }
}

function enableDisableButtonsLeader(numPlayersOnMission) {
    //if they've selected the right number of players, then allow them to send
    // console.log("countHighlightedAvatars: " + countHighlightedAvatars());
    // console.log("numPlayersOnMission: " + numPlayersOnMission);
    if (countHighlightedAvatars() == numPlayersOnMission || (countHighlightedAvatars() + "*") == numPlayersOnMission) {
        document.querySelector("#green-button").classList.remove("disabled");
    }
    else {
        document.querySelector("#green-button").classList.add("disabled");
    }
}
function enableDisableButtons() {
    if (gameStarted === false) {
        //Host
        if (ownUsername === getUsernameFromIndex(0)) {
            document.querySelector("#green-button").classList.remove("disabled");
            document.querySelector("#green-button").innerText = "Start";

            document.querySelector("#red-button").classList.remove("disabled");
            document.querySelector("#red-button").innerText = "Kick";

            //set the stuff for the kick modal buttons
            $("#red-button").attr("data-toggle", "modal");
            $("#red-button").attr("data-target", "#kickModal");

            document.querySelector("#options-button").classList.remove("hidden");
        }
        //we are spectator
        else if (isSpectator === true) {
            document.querySelector("#green-button").classList.remove("disabled");
            document.querySelector("#green-button").innerText = "Join";

            document.querySelector("#red-button").classList.add("disabled");
            // document.querySelector("#red-button").innerText = "Disabled";
        }
        else {
            disableButtons();
        }
    }
    else if (gameStarted === true && isSpectator === false) {
        //if we are in picking phase
        if (gameData.phase === "picking") {
            document.querySelector("#green-button").classList.add("disabled");
            document.querySelector("#green-button").innerText = "Pick";

            document.querySelector("#red-button").classList.add("disabled");
            // document.querySelector("#red-button").innerText = "Disabled";
        }

        //if we are in voting phase
        else if (gameData.phase === "voting") {
            if (checkEntryExistsInArray(gameData.playersYetToVote, ownUsername)) {
                document.querySelector("#green-button").classList.remove("disabled");
                document.querySelector("#green-button").innerText = "Approve";

                document.querySelector("#red-button").classList.remove("disabled");
                document.querySelector("#red-button").innerText = "Reject";
            }
            else {
                disableButtons();
            }
        }

        else if (gameData.phase === "missionVoting") {
            if (checkEntryExistsInArray(gameData.playersYetToVote, ownUsername)) {
                document.querySelector("#green-button").classList.remove("disabled");
                document.querySelector("#green-button").innerText = "SUCCEED";

                document.querySelector("#red-button").classList.remove("disabled");
                document.querySelector("#red-button").innerText = "FAIL";
            }
            else {
                disableButtons();
            }
        }

        else if (gameData.phase === "assassination") {
            // document.querySelector("#green-button").classList.add("disabled");
            document.querySelector("#green-button").innerText = "SHOOT";

            document.querySelector("#red-button").classList.add("disabled");
            // document.querySelector("#red-button").innerText = "Disabled";

            //if there is only one person highlighted
            if (countHighlightedAvatars() == 1) {
                document.querySelector("#green-button").classList.remove("disabled");
            }
            else {
                document.querySelector("#green-button").classList.add("disabled");
            }
        }
        else if (gameData.phase === "lady") {
            // document.querySelector("#green-button").classList.add("disabled");
            document.querySelector("#green-button").innerText = "Card";

            document.querySelector("#red-button").classList.add("disabled");
            // document.querySelector("#red-button").innerText = "Disabled";

            //if there is only one person highlighted
            if (countHighlightedAvatars() == 1 && ownUsername === getUsernameFromIndex(gameData.lady)) {
                document.querySelector("#green-button").classList.remove("disabled");
            }
            else {
                document.querySelector("#green-button").classList.add("disabled");
            }
        }

        else if (gameData.phase === "finished") {
            disableButtons();
        }
    }
    else if (gameStarted === true && isSpectator === true) {
        disableButtons();
    }
}

function checkEntryExistsInArray(array, entry) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === entry) {
            return true;
        }
    }
    return false;
}

function disableButtons() {
    document.querySelector("#green-button").classList.add("disabled");
    // document.querySelector("#green-button").innerText = "Disabled";

    document.querySelector("#red-button").classList.add("disabled");
    // document.querySelector("#red-button").innerText = "Disabled";
}

function countHighlightedAvatars() {
    var divs = document.querySelectorAll("#mainRoomBox div");
    var count = 0;
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].classList.contains("highlight-avatar") === true) {
            count++;
        }
    }
    return count;
}

function getHighlightedAvatars() {
    var str = "";

    var divs = document.querySelectorAll("#mainRoomBox div");

    var arr = [];

    for (var i = 0; i < divs.length; i++) {
        if (divs[i].classList.contains("highlight-avatar") === true) {
            //we need to use getUsernameFromIndex otherwise
            //we will get info from the individual player
            //such as a percy seeing a merlin?.
            str = str + getUsernameFromIndex(i) + " ";
            arr.push(getUsernameFromIndex(i));
        }
    }
    return arr;
}

function getIndexFromUsername(username) {
    if (storeData) {
        for (var i = 0; i < storeData.length; i++) {
            if (storeData[i].username === username) {
                return i;
            }
        }
    }
    else {
        return false;
    }

}

function getUsernameFromIndex(index) {
    if (storeData[index]) {
        return storeData[index].username;
    }
    else {
        return false;
    }
}

function strOfAvatar(playerData, alliance) {
    var picLink;
    if (alliance === "res") {
        if (playerData.avatarImgRes) {
            picLink = 'avatars/' + playerData.avatarImgRes;
        } else {
            picLink = 'avatars/base-res.png'
        }
    }
    else {
        if (playerData.avatarImgSpy) {
            picLink = 'avatars/' + playerData.avatarImgSpy;
        } else {
            picLink = 'avatars/base-spy.png'
        }
    }

    //add in the role of the player, and the percy info
    var role = "";
    var lady = "";

    //can improve this code here
    if (gameStarted === true && gameData.phase === "finished") {
        role = "<p class='role-p'>" + gameData.see.roles[getIndexFromUsername(playerData.username)] + "</p>";
    }

    else if (gameStarted === true) {
        //if rendering our own player, give it the role tag
        if (playerData.username === ownUsername) {
            role = "<p class='role-p'>" + gameData.role + "</p>";
        }
        else if (gameData.see.merlins.indexOf(playerData.username) !== -1) {
            role = "<p class='role-p'>" + "Merlin?" + "</p>";
        }

        if (playerData.username === getUsernameFromIndex(gameData.lady)) {
            lady = "<span class='glyphicon glyphicon-book'></span> ";
        }
    }


    //add in the hammer star
    var hammerStar = "";
    if (gameStarted === false) {
        //give hammer star to the host
        if (playerData.username === getUsernameFromIndex(0)) {
            hammerStar = "<span class='glyphicon glyphicon-star-empty'></span>";
        }
    }
    else {
        if (playerData.username === getUsernameFromIndex(gameData.hammer)) {
            hammerStar = "<span class='glyphicon glyphicon-star-empty'></span>";
        }
    }

    var selectedAvatar = "";
    if (selectedAvatars[playerData.username] === 1) {
        selectedAvatar = "selected-avatar-1";
        // console.log("HI");
    }
    else if (selectedAvatars[playerData.username] === 2) {
        selectedAvatar = "selected-avatar-2";
    }

    var str = "<div usernameofplayer='" + playerData.username + "' class='playerDiv " + selectedAvatar + "''>";

    str += "<span class='avatarOptionButtons'>";
    str += "<span id='highlightAvatarButton' class='glyphicon glyphicon-user avatarButton'></span>";
    str += "<span id='highlightChatButton' class='glyphicon glyphicon glyphicon-menu-hamburger avatarButton'></span>";
    str += "</span>";

    str += "<img class='avatarImgInRoom' src='" + picLink + "'>";
    str += "<p class='username-p'>" + lady + "" + playerData.username + " " + hammerStar + " </p>" + role + "</div>";


    return str;
}

function changeView() {
    $(".lobby-container").toggleClass("inactive-window");
    $(".game-container").toggleClass("inactive-window");

    extendTabContentToBottomInRoom();
}

function scrollDown() {
    var chatWindows = $(".chat-window");

    for (var i = 0; i < chatWindows.length; i++) {
        $(".chat-window")[i].scrollTop = $(".chat-window")[i].scrollHeight;
    }
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function generatePlayerLocations(numOfPlayers, a, b) {
    //CONICS :D
    var x_ = [];
    var y_ = [];
    var step = 360 / numOfPlayers;
    var tiltOffset = 0;
    // console.log("Step: " + step);

    //for 6p and 10p, rotate slightly so that usernames dont collide
    //with the role text
    if (numOfPlayers === 6 || numOfPlayers === 10) {
        var tiltOffset = step / 2;
    }

    for (var i = 0; i < numOfPlayers; i++) {

        //get the coordinates. Note the +90 is to rotate so that
        //the first person is at the top of the screen
        x_[i] = a * (Math.cos(toRadians((step * i) + 90 + tiltOffset))) * 0.85;
        y_[i] = b * (Math.sin(toRadians((step * i) + 90 + tiltOffset))) * 0.7;
        // x_[i] = a*(Math.cos(toRadians((step*i) + 90)));
        // y_[i] = b*(Math.sin(toRadians((step*i) + 90)));
    }

    var object = {
        x: x_,
        y: y_
    }
    return object;
}

function drawVoteHistory(data) {
    var numOfPicksPerMission = [];
    var str = "";
    //top row where missions are displayed
    //extra <td> set is for the top left corner of the table
    str += "<tr><td></td>";

    for (var i = 0; i < data.missionNum; i++) {
        str += "<td class='' style='width: 11em;' colspan='' id='missionHeader" + (i + 1) + "'>Mission " + (i + 1) + "</td>";
    }
    str += "</tr>";

    //for every username
    for (var key in data.voteHistory) {
        if (data.voteHistory.hasOwnProperty(key)) {
            // console.log(key + " -> " + data.voteHistory[key]);
            str += "<tr>";
            //print username in the first column
            str += "<td>" + key + "</td>";

            //Individual mission voteHistory
            //for every mission
            for (var i = 0; i < data.voteHistory[key].length; i++) {
                numOfPicksPerMission[i] = 0;

                //for every pick
                for (var j = 0; j < data.voteHistory[key][i].length; j++) {
                    // console.log(data.voteHistory[key][i][j]);
                    str += "<td class='" + data.voteHistory[key][i][j] + "''>";
                    str += "</td>";
                    numOfPicksPerMission[i]++;
                }
            }
            str += "</tr>"
        }
    }

    $("#voteHistoryTable")[0].innerHTML = str;

    //set the right colspans for the mission headers
    for (var i = 0; i < numOfPicksPerMission.length; i++) {
        var id = "#missionHeader" + (i + 1);
        $(id).attr("colspan", numOfPicksPerMission[i]);
    }
}


function getOptions() {

    var data = {
        merlinassassin: $("#merlinassassin")[0].checked,
        percival: $("#percival")[0].checked,
        morgana: $("#morgana")[0].checked,
        lady: $("#lady")[0].checked,
        mordred: $("#mordred")[0].checked,
        oberon: $("#oberon")[0].checked
    }
    return data;

}

function getKickPlayers() {
    var data = {};

    for(var i = 0; i < storeData.length; i++){
        if($("#" + storeData[i].username)[0].checked === true){
            data[storeData[i].username] = true;
        }
    }

    return data;
}

function resetAllGameData() {
    roomId = undefined;
    //reset all the variables
    storeData = undefined;
    seeData = undefined;
    gameData = undefined;
    gameStarted = false;
    numPlayersOnMission = [];
    inRoom = false;
    //note do not reset our own username.
    isSpectator = false;

    selectedAvatars = {};

    print_gameplay_text_game_started = false;
    print_gameplay_text_picked_team = false;
    print_gameplay_text_vote_results = false;
    print_last_mission_num = 1;

    //hide the options cog
    document.querySelector("#options-button").classList.add("hidden");

    //reset room-chat 
    // console.log("RESET ROOM CHAT");
    $(".room-chat-list").html("");
}

function extendTabContentToBottomInRoom() {
    //extending the tab content to the bottom of the page:
    var gameContainer = $(".game-container")[0];
    var tabContainer = $(".tab-content")[0];
    // var offsetTop = tabContainer.offsetTop;
    var newHeight2 = gameContainer.offsetHeight - tabContainer.offsetTop;
    // console.log("gamecontainerheight: " + gameContainer.offsetHeight);
    // console.log("tabcontainertoppos: " + tabContainer.offsetTop);
    // console.log("New height 2: " + newHeight2);
    tabContainer.style.height = (newHeight2 * 1.2) + "px";
}



var commands;
function assignCommands(serverCommands) {
    commands = serverCommands;
}

var lastChatBoxCommand = "";
function checkMessageForCommands(message, chatBox) {
    arrayMessage = message.split(" ");
    // console.log("arr message: " + arrayMessage);

    if (message[0] === '/') {
        console.log("COMMAND INPUT DETECTED");
        var validCommandFound = false;

        //need to change this to only up to the first space
        messageCommand = arrayMessage[0].slice(1, arrayMessage[0].length);

        var commandCalled = "";

        //cycle through the commands and try to find the command.
        for (var key in commands) {
            if (commands.hasOwnProperty(key)) {
                // console.log(key + " -> " + commands[key]);
                if (messageCommand === commands[key].command) {

                    console.log("Command: " + commands[key].command + " called.");
                    commandCalled = commands[key].command;
                    validCommandFound = true;
                    break;
                }
            }
        }

        if (validCommandFound === false) {
            console.log("Command invalid");
            var str = messageCommand + " is not a valid command. Type /help for a list of commands."; 9
            var data = { message: str }
            addToAllChat(data, "server-text");
            addToRoomChat(data, "server-text");
        }
        else {
            //sending command to server
            console.log("Sending command: " + messageCommand + " to server.");
            socket.emit("messageCommand", { command: messageCommand, args: arrayMessage });
        }

        lastChatBoxCommand = chatBox;
        return true;
    }
    else {
        return false;
    }
}


// var userCommands = {
//     commandA: {
//         command: "commandAType",
//         help: "Just some text for commandA",
//         socketCommand: "commandA~"
//     },

//     help: {
//         command: "help",
//         help: "Come on, if you don't know what this command does YOU need help.",
//         socketCommand: "help"
//     }
// };