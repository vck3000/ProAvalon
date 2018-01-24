var socket = io({transports: ['websocket'], upgrade: false});
console.log("started");




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
            //scroll down
            $("#chat-window")[0].scrollTop = $("#chat-window")[0].scrollHeight;
        }

    }
};

socket.on("allChatToClient", function(data){
	var date = "[" + data.date + "]";
	var str = "<li class=other>" + date + " " + data.username + ": " + data.message;
	$("#chat-list").append(str);
    //scroll down
    $("#chat-window")[0].scrollTop = $("#chat-window")[0].scrollHeight;
});

socket.on("player-joined-lobby", function(username){
    var str = "<li class=server-text>" + username + " has joined the lobby!";
    $("#chat-list").append(str);
});

socket.on("player-left-lobby", function(username){
    var str = "<li class=server-text>" + username + " has left the lobby.";
    $("#chat-list").append(str);
});

socket.on("alert", function(data){
    alert(data);
    window.location.replace("/");
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




document.querySelector("#testButton").addEventListener("click", function(){
    document.querySelector(".lobby-container").classList.toggle("inactive-window");
})