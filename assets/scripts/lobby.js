var socket = io();


document.querySelector("#chat-message-input").onkeyup = function (e) {
	//When enter is pressed in the chatmessageinput
	if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = this.value;
        //append 0 in front of single digit minutes
        var dateMinutes = d.getMinutes();

        if(dateMinutes.toString.length == 1){
        	dateMinutes = "0" + d.getMinutes();
        }

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
    }
};

socket.on("allChatToClient", function(data){
	var date = "[" + data.date + "]";
	var str = "<li class=other>" + date + " " + data.username + ": " + data.message;
	$("#chat-list").append(str);
});

socket.on("newPlayerJoinedLobby", function(data){
	console.log(data.username);
	console.log(data.currentPlayers);

	$("#current-players-list").remove();

	data.currentPlayers.forEach(function(currentPlayer){
		var str = "<li>" + currentPlayer.username + "</li>";
		$("#current-players-list").append(str);
	});
});




