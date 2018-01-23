var socket = io();


document.querySelector("#chat-message-input").onkeyup = function (e) {
	if (e.keyCode == 13) {
        // Do something

        var d = new Date();

        console.log("ENTER PRESSED at " + d.getHours());

        

        //set up the data structure:
        var message = this.value;
        var date = "" + d.getHours() + ":" + d.getMinutes();
        var data = {
        	date: date,
        	message: message
        }

        //reset the value of the textbox
        
        this.value = "";
        //send data to the server 

        socket.emit("allChatFromClient", data);
    }
};

socket.on("allChatToClient", function(data){
	$("#chat-list").append($('<li>').text(data.message));
});




