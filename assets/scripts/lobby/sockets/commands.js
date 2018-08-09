//==========================================
//COMMANDS
//==========================================
socket.on("commands", function (commands) {
    assignCommands(commands);
}); 

var modCommands;
socket.on("modCommands", function (commands) {

    if(!modCommands){
        $("#modActionCloseButton").on("click", function(){
            $("#modModal").modal("hide");
            
            console.log($("#modactionform").serializeArray());
            var data = $("#modactionform").serializeArray();

            socket.emit("modAction", data);
        });
    }
    modCommands = commands;
}); 

var adminCommands;
socket.on("adminCommands", function (commands) {
    adminCommands = commands;
}); 


socket.on("messageCommandReturnStr", function (data) {
    data.dateCreated = new Date();
    if (lastChatBoxCommand === "allChat") {
        addToAllChat(data);
    }
    else if (lastChatBoxCommand === "roomChat") {
        addToRoomChat(data);
    }
  // console.log("received return str");
});

var timeLastBuzzSlap;
socket.on("slap", function (username) {
    if(isPlayerMuted(username) === false){
        if($("#option_notifications_sound_slap")[0].checked === true){
            if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
                playSound("slap");
                
                timeLastBuzzSlap = new Date();

                var data = {
                    message: "You have been slapped by " + username + ".", 
                    classStr: "server-text",
                    dateCreated: new Date()
                }
                setTimeout(function () {
                    addToAllChat(data);
                    addToRoomChat(data);
                }, 1100);
            }
        }
    }
});

socket.on("buzz", function (username) {
    if(isPlayerMuted(username) === false){
        if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
            if($("#option_notifications_sound_buzz")[0].checked === true){
                playSound("ding");
    
                var data = { 
                    message: "You have been buzzed by " + username + ".", 
                    classStr: "server-text",
                    dateCreated: new Date()
                }
                setTimeout(function () {
                    addToAllChat(data);
                    addToRoomChat(data);
                }, 0);
            }
    
            if($("#option_notifications_desktop_buzz")[0].checked === true){
                displayNotification(username + " has buzzed you!", "", "avatars/base-spy.png", "buzz");
            }
        }
    }
    
});

socket.on("lick", function (username) {
    if(isPlayerMuted(username) === false){    
        if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
            if($("#option_notifications_sound_buzz")[0].checked === true){
                playSound("lick");

                var data = { 
                    message: "You have been licked by " + username + ".", 
                    classStr: "server-text",
                    dateCreated: new Date()
                }
                setTimeout(function () {
                    addToAllChat(data);
                    addToRoomChat(data);
                }, 0);
            }
        }
    }
});

socket.on("toggleNavBar", function (username) {
    $(".navbar").toggle("hidden");
});