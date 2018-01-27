var socket = io({transports: ['websocket'], upgrade: false});
console.log("started");

var storeData;
//window resize, repaint the users
window.addEventListener('resize', function(){
    console.log("Resized");
    drawPlayers(storeData);
}); 


//button event listeners
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
});


document.querySelector("#chat-message-input").onkeyup = function (e) {
	//When enter is pressed in the chatmessageinput
	if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = this.value;

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
            this.value = "";
            //send data to the server 
            socket.emit("allChatFromClient", data);

            //add the self chat
            var dateStr = "[" + data.date + "]";
            var str = "<li class=self>" + dateStr + " Me: " + data.message;
            $("#chat-list").append(str);

            scrollDown();
        }

    }
};

socket.on("allChatToClient", function(data){

	var date = "[" + data.date + "]";
	var str = "<li class=other>" + date + " " + data.username + ": " + data.message;
	$("#chat-list").append(str);

    scrollDown();
});

socket.on("player-joined-lobby", function(username){
    var str = "<li class=server-text>" + username + " has joined the lobby!";
    $("#chat-list").append(str);
    scrollDown();
});

socket.on("player-left-lobby", function(username){
    var str = "<li class=server-text>" + username + " has left the lobby.";
    $("#chat-list").append(str);
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
                changeView();
            });
        }
    });
});




//notifications code
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





//ROOM CODE
document.querySelector("#testLink").addEventListener("click", function(){
    socket.emit("newRoom");
}); 

socket.on("new-game-created", function(str){
    var str = "<li class=server-text>" + str + "</li>";
    $("#chat-list").append(str);
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


function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function generatePlayerLocations(numOfPlayers, a, b){
    //CONICS :D
    var x_ = [];
    var y_ = [];
    var step = 360/numOfPlayers;

    for(var i = 0; i < numOfPlayers; i++){
        //get the coordinates. Note the +90 is to rotate so that
        //the first person is at the top of the screen
        x_[i] = a*(Math.cos(toRadians((step*i) + 90)))*0.6;
        y_[i] = b*(Math.sin(toRadians((step*i) + 90)))*0.6;
    }

    var object = {
        x: x_,
        y: y_
    }
    return object;
}


socket.on("update-room-players", function(data){
    // var x = $("#typehead").parent().width();
    storeData = data;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

    console.log("update room players");
    console.log(data);

    drawPlayers(data);
});

function drawPlayers(data){
    if(data){
        var w = $("#mainRoomBox").width();
        var h = $("#mainRoomBox").height();

        var numPlayers = data.length;//3;

        var playerLocations = generatePlayerLocations(numPlayers, w/2, h/2);

        // console.log("w: " + w + "    h: " + h);
        // console.log(playerLocations);


        //generate the divs in the html
        var str = "";
        for(var i = 0 ; i < numPlayers; i++){
            if(data[i] && data[i].avatarImg){
                console.log(data[i].avatarImg);
                str = str + "<div><img src='" + data[i].avatarImg + "'><p style='text-align: center;'> hi! " + i + " </p></div>";    
            }else {
                str = str + "<div><img src='base-res.png'> hi! " + i + " </div>";    
            }
            
        }
        //set the divs into the box
        $("#mainRoomBox").html(str);


        //set the positions
        var divs = document.querySelectorAll("#mainRoomBox div");
        for(var i = 0 ; i < numPlayers; i++){
            var offsetX = w/2 ;
            var offsetY = h/2 ;

            var strX = playerLocations.x[i] + offsetX + "px";
            var strY = playerLocations.y[i] + offsetY + "px";

            divs[i].style.left = strX;
            divs[i].style.bottom = strY;
        }
    }
}


function changeView(){
    $(".lobby-container").toggleClass("inactive-window");
    $(".game-container").toggleClass("inactive-window");

}

function scrollDown(){
    //scroll down
    $("#chat-window")[0].scrollTop = $("#chat-window")[0].scrollHeight;
}