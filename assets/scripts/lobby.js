var socket = io({transports: ['websocket'], upgrade: false});
console.log("started");

//for the game (like players in game)
var storeData;
var seeData;
var gameData;
var roomId; 
var gameStarted = false;
var ownUsername = "";
//window resize, repaint the users
window.addEventListener('resize', function(){
    console.log("Resized");
    draw(storeData);
}); 


//======================================
//BUTTON EVENT LISTENERS
//======================================
document.querySelector("#green-button").addEventListener("click", greenButtonFunction);
document.querySelector("#red-button").addEventListener("click", redButtonFunction);

//new ROOM CODE
document.querySelector("#testLink").addEventListener("click", function(){
    socket.emit("newRoom");
}); 

document.querySelector("#danger-alert-box-button").addEventListener("click", function(){
    document.querySelector("#danger-alert-box").classList.add("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#success-alert-box-button").addEventListener("click", function(){
    document.querySelector("#success-alert-box").classList.add("inactive-window");
    document.querySelector("#success-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#backButton").addEventListener("click", function(){
    changeView();
    socket.emit("leave-room", "");
    roomId = undefined; 
    //reset all the variables
    storeData = [];
    seeData = [];
    gameData = [];
    roomId = undefined; 
    gameStarted = false;
    numPlayersOnMission = [];
    //note do not reset our own username.

    //reset room-chat 
    $(".room-chat-list").html("");

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

function addAllChatEventListeners(e, allChatWindow){
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = allChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if(message && message.length > 0){
            //append 0 in front of single digit minutes
            var dateMinutes = d.getMinutes();

            var date = "" + d.getHours() + ":" + dateMinutes;
            var data = {
                date: date,
                message: message
            }

            //reset the value of the textbox
            allChatWindow.value = "";
            //send data to the server 
            socket.emit("allChatFromClient", data);

            //add the self chat
            var dateStr = "[" + data.date + "]";
            var str = "<li class=self>" + dateStr + " Me: " + data.message;

            $(".all-chat-list").append(str);
            
            scrollDown();
        }

    }
}

var roomChatWindow = document.querySelector(".room-chat-message-input");
roomChatWindow.onkeyup = function(e){
    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = roomChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if(message && message.length > 0){
            //append 0 in front of single digit minutes
            var dateMinutes = d.getMinutes();

            var date = "" + d.getHours() + ":" + dateMinutes;
            var data = {
                date: date,
                message: message,
                roomId: roomId
            }

            //reset the value of the textbox
            roomChatWindow.value = "";
            //send data to the server 
            socket.emit("roomChatFromClient", data);

            //add the self chat
            var dateStr = "[" + data.date + "]";
            var str = "<li class=self>" + dateStr + " Me: " + data.message;

            $(".room-chat-list").append(str);
            
            scrollDown();
        }
    }
}





//======================================
//SOCKET ROUTES
//======================================
socket.on("username", function(username){
    ownUsername = username;
});

socket.on("allChatToClient", function(data){

	var date = "[" + data.date + "]";
	var str = "<li class=other>" + date + " " + data.username + ": " + data.message;

    console.log("all chat inc");

    $(".all-chat-list").append(str);

    scrollDown();
});

socket.on("roomChatToClient", function(data){

    var date = "[" + data.date + "]";
    var str = "<li class=other>" + date + " " + data.username + ": " + data.message;

    $(".room-chat-list").append(str);

    scrollDown();
});

socket.on("player-joined-lobby", function(username){
    var str = "<li class=server-text>" + username + " has joined the lobby!";
    $(".all-chat-list").append(str);
    scrollDown();
});

socket.on("player-left-lobby", function(username){
    var str = "<li class=server-text>" + username + " has left the lobby.";
    $(".all-chat-list").append(str);
    scrollDown();
});

socket.on("player-joined-room", function(username){
    var str = "<li class=server-text>" + username + " has joined the room!";
    $(".room-chat-list").append(str);
    scrollDown();
});

socket.on("player-left-room", function(username){
    var str = "<li class=server-text>" + username + " has left the room.";
    $(".room-chat-list").append(str);
    scrollDown();
});

socket.on("update-current-players-list", function(currentPlayers){
    console.log("update the current player list request received");
    console.log(currentPlayers);
    //remove all the li's inside the list
    $("#current-players-list li").remove();
    
    //append each player into the list
    currentPlayers.forEach(function(currentPlayer){
      var str = "<li>" + currentPlayer + "</li>";
      $("#current-players-list").append(str);
  });
});

socket.on("update-current-games-list", function(currentGames){
    console.log("update the current games list request received");
    console.log(currentGames);
    //remove all the li's inside the list
    $("#current-games-list li").remove();
    
    //append each player into the list
    currentGames.forEach(function(currentGame){
        //if the currentGame exists
        if(currentGame){
            var str = "<li id='list'>" + currentGame.roomId + ": " + currentGame.status + "</li>";
            
            //add the li to the list
            $("#current-games-list").append(str);

            //grab all li's
            var allLis = document.querySelectorAll("#current-games-list li");

            //add the event listener to the last li added.
            allLis[allLis.length - 1].addEventListener("click", function(){
                //JOIN THE ROOM
                // console.log(currentGame.roomId);
                socket.emit("join-room", currentGame.roomId);
                //change the view to the room instead of lobby
                roomId = currentGame.roomId;
                changeView();
            });
        }
    });
});

socket.on("new-game-created", function(str){
    var str = "<li class=server-text>" + str + "</li>";
    $(".all-chat-list").append(str);
});

socket.on("auto-join-room-id", function(roomID){
    console.log("auto join room");
    //received a request from server to auto join
    //likely we were the one who created the room
    //so we auto join into it
    socket.emit("join-room", roomID);
    //chang ethe view to the room instead of lobby
    changeView();
});




//======================================
//NOTIFICATION SOCKET ROUTES
//======================================
socket.on("alert", function(data){
    alert(data);
    window.location.replace("/");
});

socket.on("danger-alert", function(data){
    document.querySelector("#danger-alert-box").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box").textContent = data + "        |        Press here to remove";
});

socket.on("success-alert", function(data){
    document.querySelector("#success-alert-box").classList.remove("inactive-window");
    document.querySelector("#success-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#success-alert-box").textContent = data + "        |        Press here to remove";
});













socket.on("update-room-players", function(data){
    // var x = $("#typehead").parent().width();
    storeData = data;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

    console.log("update room players");
    console.log(data);

    draw(data);
});

//======================================
//GAME SOCKET ROUTES
//======================================
socket.on("game-data", function(data){
    if(data){
        console.log("game starting!");

        console.log(data);
        // seeData = data; 
        gameData = data;

        gameStarted = true;

        draw(storeData);
    } 
});

socket.on("update-status-message", function(data){
    if(data){
        $("#status").textContent = data;
    }
});

//======================================
//FUNCTIONS
//======================================
function redButtonFunction() {
    console.log("Voted reject");
    socket.emit("pickVote", "reject");
}

function greenButtonFunction() {
    //if button is not disabled: 
    if(document.querySelector("#green-button").classList.contains("disabled") === false){
        if(gameStarted === false){
            socket.emit("startGame", "");
        }   
        else{
            if(gameData.phase === "picking"){
                console.log("Picked team: asdf");

                var str = getHighlightedAvatars();
                console.log(str);
                socket.emit("pickedTeam", str);    
            }
            else if(gameData.phase === "voting"){
                console.log("Voted approve");
                socket.emit("pickVote", "approve");
            }
            
        } 
    }
}


function draw(){
    console.log("draw called");
    if(storeData){
        drawAndPositionAvatars();

        drawTeamLeaderStar();

        if(gameStarted === true){
            drawMiddleBoxes();

            //default greyed out rn
            enableDisableButtons();

            //Edit the status bar/well
            if(gameData.phase === "picking"){
                //give it the default status message
                document.querySelector("#status").innerText = gameData.statusMessage;    
                
                //draw the votes if there are any to show
                drawVotes(gameData.votes);
                
            }
            else if(gameData.phase === "voting"){

                drawGuns();

                //show the remaining players who haven't voted
                var str = "Waiting for votes: ";

                for(var i = 0; i < gameData.playersYetToVote.length; i++){
                    str = str + gameData.playersYetToVote[i] + ", ";
                }

                document.querySelector("#status").innerText = str;      
            }
            else if(gameData.phase === "missionVoting"){
                //show the remaining players who haven't voted
                var str = "Waiting for mision votes: ";

                for(var i = 0; i < gameData.playersYetToVote.length; i++){
                    str = str + gameData.playersYetToVote[i] + ", ";
                }

                document.querySelector("#status").innerText = str;     

                drawGuns();
                drawVotes(gameData.votes);
            }

            //if we are the team leader---------------------------------------------
            if(getIndexFromUsername(ownUsername) === gameData.teamLeader){
                teamLeaderSetup(gameData.phase);              
            }    
        }
    }
}

function drawVotes(votes){
    var divs = document.querySelectorAll("#mainRoomBox div");

    if(votes){
        for(var i = 0; i < divs.length; i++){
            document.querySelectorAll("#mainRoomBox div")[i].classList.add(votes[i]);
        }  
    }
    else{
        for(var i = 0; i < divs.length; i++){
            document.querySelectorAll("#mainRoomBox div")[i].classList.remove("approve");
            document.querySelectorAll("#mainRoomBox div")[i].classList.remove("reject");
        }  
    }

}

function teamLeaderSetup(phase){
    var numPlayersOnMission = gameData.numPlayersOnMission[gameData.missionNum-1];

    //edit the well to show how many people to pick.
    if(phase === "picking"){
        document.querySelector("#status").innerText = "Your turn to pick a team! Pick " + numPlayersOnMission +" players!";    
    }
    

    var divs = document.querySelectorAll("#mainRoomBox div");
    //add the event listeners for button press
    for(var i = 0; i < divs.length; i++){
        divs[i].addEventListener("click", function(){
            console.log("avatar pressed");
            //toggle the highlight class
            this.classList.toggle("highlight-avatar");
            //change the pick team button to enabled/disabled
            enableDisableButtonsLeader(numPlayersOnMission);
        });   
    }  
}

function drawMiddleBoxes(){
    //draw missions and numPick
    //j<5 because there are only 5 missions/picks each game
    for(var j = 0; j < 5; j++){
        //missions
        var missionStatus = gameData.missionHistory[j];
        if(missionStatus){
            if(missionStatus === "succeed"){
                document.querySelectorAll(".missionBox")[j].classList.add("missionBoxSucceed");
                document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxFail");
            } else{
                document.querySelectorAll(".missionBox")[j].classList.add("missionBoxFail");
                document.querySelectorAll(".missionBox")[j].classList.remove("missionBoxSucceed");
            }
        }

        //draw in the number of players in each mission
        var numPlayersOnMission = gameData.numPlayersOnMission[j];
        if(numPlayersOnMission){
            document.querySelectorAll(".missionBox")[j].innerText = numPlayersOnMission;
        }
    }    

    //picks boxes
    var pickNum = gameData.pickNum;
    for(var j = 0; j < 5; j++){
        if(j < pickNum){
            document.querySelectorAll(".pickBox")[j].classList.add("pickBoxFill");    
        }
        else{
            document.querySelectorAll(".pickBox")[j].classList.remove("pickBoxFill");       
        }
        
    }
}


function drawAndPositionAvatars(){
    var w = $("#mainRoomBox").width();
    var h = $("#mainRoomBox").height();

    var numPlayers = storeData.length;//3;

    //generate the divs in the html
    var str = "";
    console.log("Game started: " + gameStarted);
    if(gameStarted === true){
        //draw the players according to what the client sees (their role sees)
        for(var i = 0 ; i < numPlayers; i++){

            console.log("draw");
            console.log("storeData: ");
            console.log(storeData);

            //check if the user is on the spy list. 
            //if they are not, they are res
            if(gameData.see.spies && gameData.see.spies.indexOf(storeData[i].username) === -1){
                str = str + strOfAvatar(storeData[i], "res");
            } 
            //else they are a spy
            else{
                str = str + strOfAvatar(storeData[i], "spy");
            }
        }    
    } 
    //when game has not yet started, everyone is a res image
    else{
        for(var i = 0 ; i < numPlayers; i++){
            str = str + strOfAvatar(storeData[i], "res");
        }  
    }

    //set the divs into the box
    $("#mainRoomBox").html(str);
    

    //===============================================
    //POSITIONING SECTION
    //===============================================
    
    //set the positions and sizes
    console.log("numPlayers: " + numPlayers)
    var divs = document.querySelectorAll("#mainRoomBox div");
    var playerLocations = generatePlayerLocations(numPlayers, w/2, h/2);

    for(var i = 0 ; i < numPlayers; i++){
        // console.log("player position: asdflaksdjf;lksjdf");
        var offsetX = w/2 ;
        var offsetY = h/2 ;

        var strX = playerLocations.x[i] + offsetX + "px";
        var strY = playerLocations.y[i] + offsetY + "px";

        divs[i].style.left = strX;
        divs[i].style.bottom = strY;

        var ratioXtoY = 0.8;

        divs[i].style.height = 30 + "%";
        divs[i].style.width = divs[i].offsetHeight*ratioXtoY + "px";

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

function drawGuns(){

    // gameData.propsedTeam
    for(var i = 0; i < gameData.proposedTeam.length; i++){
        //set the div string and add the gun
        var str = $("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])].innerHTML;
        str = str + "<span><img src='gun.png' class='gun'></span>";
        //update the str in the div
        $("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])].innerHTML = str;
    }
}

function drawTeamLeaderStar(){
    //team leader star part!----------------------------------------------------
    var playerIndex;
    if(gameStarted === false){
        playerIndex = 0;
    } else {
        playerIndex = gameData.teamLeader;
    }
    //set the div string and add the star
    var str = $("#mainRoomBox div")[playerIndex].innerHTML;
    str = str + "<span><img src='leader.png' class='leaderStar'></span>";
    //update the str in the div
    $("#mainRoomBox div")[playerIndex].innerHTML = str;

    $(".leaderStar")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
    //team leader star part!----------------------------------------------------
}

function enableDisableButtonsLeader(numPlayersOnMission){
    //if they've selected the right number of players, then allow them to send
    console.log("countHighlightedAvatars: " + countHighlightedAvatars());
    console.log("numPlayersOnMission: " + numPlayersOnMission);
    if(countHighlightedAvatars() == numPlayersOnMission){
        document.querySelector("#green-button").classList.remove("disabled");
    }
    else{
        document.querySelector("#green-button").classList.add("disabled");
    }
}
function enableDisableButtons(){
    //if we are in picking phase
    if(gameData.phase === "picking"){
        document.querySelector("#green-button").classList.add("disabled");
        document.querySelector("#green-button").innerText = "Pick!";

        document.querySelector("#red-button").classList.add("disabled");
        document.querySelector("#red-button").innerText = "Disabled";
    } 

    //if we are in voting phase
    else if(gameData.phase === "voting")
    {
        if(checkEntryExistsInArray(gameData.playersYetToVote, ownUsername)){
            document.querySelector("#green-button").classList.remove("disabled");
            document.querySelector("#green-button").innerText = "Approve";

            document.querySelector("#red-button").classList.remove("disabled");
            document.querySelector("#red-button").innerText = "Reject";
        }
        else{
            disableButtons();
        }   
    }

    else if(gameData.phase === "missionVoting"){
        if(checkEntryExistsInArray(gameData.playersYetToVote, ownUsername)){
            document.querySelector("#green-button").classList.remove("disabled");
            document.querySelector("#green-button").innerText = "SUCCEED";

            document.querySelector("#red-button").classList.remove("disabled");
            document.querySelector("#red-button").innerText = "FAIL";
        }
        else{
            disableButtons();
        }   
    }
}

function checkEntryExistsInArray(array, entry){
    for(var i = 0; i < array.length; i++){
        if(array[i] === entry){
            return true;
        }
    }
    return false;
}

function disableButtons(){
    document.querySelector("#green-button").classList.add("disabled");
    document.querySelector("#green-button").innerText = "Disabled";

    document.querySelector("#red-button").classList.add("disabled");
    document.querySelector("#red-button").innerText = "Disabled";
}

function countHighlightedAvatars(){
    var divs = document.querySelectorAll("#mainRoomBox div");
    var count = 0;
    for(var i = 0; i < divs.length; i++){
        if(divs[i].classList.contains("highlight-avatar") === true){
            count++;
        }
    }
    return count;
}

function getHighlightedAvatars(){
    var str = "";

    var divs = document.querySelectorAll("#mainRoomBox div");

    for(var i = 0; i < divs.length; i++){
        if(divs[i].classList.contains("highlight-avatar") === true){
            //we need to use getUsernameFromIndex otherwise
            //we will get info from the individual player
            //such as a percy seeing a merlin?.
            str = str + getUsernameFromIndex(i) + " ";
        }
    }
    return str;
}

function getIndexFromUsername(username){
    if(gameStarted === true){

        for(var i = 0; i < storeData.length; i++){
            if(storeData[i].username === username){
                return i;
            }
        }
    }
    else{
        return false;
    }
}

function getUsernameFromIndex(index){
    if(storeData[index]){
        return storeData[index].username;
    }
    else {
        return false;
    }
}

function strOfAvatar(playerData, alliance){
    var picLink;
    if(alliance === "res"){
        if(playerData.avatarImgRes){
            picLink = playerData.avatarImgRes;
        } else{
            picLink = 'base-res.png'    
        }
    }
    else{
        if(playerData.avatarImgSpy){
            picLink = playerData.avatarImgSpy;
        } else{
            picLink = 'base-spy.png'    
        }
    }

    //add in the role of the player, and the percy info
    var role = ""; 
    if(gameStarted === true){
        //if rendering our own player, give it the role tag
        if(playerData.username === ownUsername){
            role = gameData.role;
        }
        else if(gameData.see.merlins.indexOf(playerData.username) !== -1){
            role = "Merlin?";
        }  
    }

    //add in the hammer star
    var hammerStar = "";
    if(gameStarted === false){
        //give hammer star to the host
        if(playerData.username === getUsernameFromIndex(0)){
            hammerStar = "<span class='glyphicon glyphicon-star-empty'></span>";
        }
    }
    else{
        if(playerData.username === getUsernameFromIndex(gameData.hammer)){
            hammerStar = "<span class='glyphicon glyphicon-star-empty'></span>";
        }
    }

    return "<div><img class='avatarImgInRoom' src='" + picLink + "'><p class='username-p'>" + playerData.username + " " + hammerStar + " </p><p class='role-p'>" + role + "</p></div>";    
}



function changeView(){
    $(".lobby-container").toggleClass("inactive-window");
    $(".game-container").toggleClass("inactive-window");
}

function scrollDown(){
    var chatWindows = $(".chat-window");

    for(var i = 0; i < chatWindows.length; i++){
        $(".chat-window")[i].scrollTop = $(".chat-window")[i].scrollHeight;
    }
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function generatePlayerLocations(numOfPlayers, a, b){
    //CONICS :D
    var x_ = [];
    var y_ = [];
    var step = 360/numOfPlayers;
    var tiltOffset = 0;
    console.log("Step: " + step);

    //for 6p and 10p, rotate slightly so that usernames dont collide
    //with the role text
    if(numOfPlayers === 6 || numOfPlayers === 10){
        var tiltOffset = step/2;
    }

    for(var i = 0; i < numOfPlayers; i++){

        //get the coordinates. Note the +90 is to rotate so that
        //the first person is at the top of the screen
        x_[i] = a*(Math.cos(toRadians((step*i) + 90 + tiltOffset)))*0.85;
        y_[i] = b*(Math.sin(toRadians((step*i) + 90 + tiltOffset)))*0.6;
        // x_[i] = a*(Math.cos(toRadians((step*i) + 90)));
        // y_[i] = b*(Math.sin(toRadians((step*i) + 90)));
    }

    var object = {
        x: x_,
        y: y_
    }
    return object;
}