var allChatWindow1 = document.querySelectorAll(".all-chat-message-input")[0];
allChatWindow1.onkeydown = function (e, allChatWindow1) {
    //When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

var allChatWindow2 = document.querySelectorAll(".all-chat-message-input")[1];
allChatWindow2.onkeydown = function (e, allChatWindow2) {
    //When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

var allChatWindow3 = document.querySelectorAll(".all-chat-message-input")[2];
allChatWindow3.onkeydown = function (e, allChatWindow3) {
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
            scrollDown("all-chat-lobby");
            scrollDown("all-chat-room");
            scrollDown("all-chat-room2");
        }

    }
}

var roomChatWindow1 = document.querySelectorAll(".room-chat-message-input")[0];

roomChatWindow1.onkeydown = function (e, roomChatWindow1) {
    //When enter is pressed in the chatmessageinput
    addRoomChatEventListeners(e, this);
};

var roomChatWindow2 = document.querySelectorAll(".room-chat-message-input")[1];
roomChatWindow2.onkeydown = function (e, roomChatWindow2) {
    //When enter is pressed in the chatmessageinput
    addRoomChatEventListeners(e, this);
};

function addRoomChatEventListeners(e, roomChatWindow) {
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

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
            scrollDown("room-chat-room");
            scrollDown("room-chat-room2");
        }

    }
}



function addToAllChat(data) {
    // console.log("raw data");
    // console.log(data);

    if(data){
        //if it is not an array, force it into a array
        if (data[0] === undefined) {
        //   console.log("force array");
            data = [data];
        }  

      // console.log("add to all chat: ");
      // console.log(data);

        for (var i = 0; i < data.length; i++) {
            if(data[i] && data[i].message){
                //set up the date:
                var date;
                var d;
                if(data[i].dateCreated){
                    d = new Date(data[i].dateCreated);
                }
                else{
                    d = new Date();                        
                }
                var hour = d.getHours();
                var min = d.getMinutes();
                if (hour < 10) { hour = "0" + hour; }
                if (min < 10) { min = "0" + min; }
                date = "[" + hour + ":" + min + "]"; 

                // if(!data[i].dateCreated){
                //     date = "[" + "]";
                // }



                var filteredMessage = data[i].message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/, "&amp;nbsp;");

                var str = "";
                if (data[i].classStr && data[i].classStr !== "") {
                    str = "<li class='" + data[i].classStr + "'><span class='date-text'>" + date + "</span> " + filteredMessage;
                }
                else {
                    str = "<li class='" + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + filteredMessage;
                }

                //if they've muted this player, then just dont show anything. reset str to nothing.
                if(isPlayerMuted(data[i].username) === true){
                    str = "";
                }

                $(".all-chat-list").append(str);
                scrollDown("all-chat-lobby");
                scrollDown("all-chat-room");
                scrollDown("all-chat-room2");
                

                //yellow notification on the tabs in room.
                if ($(".nav-tabs #all-chat-in-game-tab").hasClass("active") === false) {
                    $(".nav-tabs #all-chat-in-game-tab")[0].classList.add("newMessage"); 
                }
                
                if(!roomPlayersData){
                    // console.log("REMOVED");
                    $(".nav-tabs #all-chat-in-game-tab")[0].classList.remove("newMessage"); 
                }
            }
        }
    }
}



function addToRoomChat(data) {
    //if it is not an array, force it into a array
    if(data){
        if (data[0] === undefined) {
            data = [data];
        }

        var usernamesOfPlayersInGame = [];
        if(gameStarted === true){
            roomPlayersData.forEach(function(obj){
                usernamesOfPlayersInGame.push(obj.username);
            });
        }
    
        for (var i = 0; i < data.length; i++) {
            //format the date
            // var d = new Date();
            // var hour = d.getHours();
            // var min = d.getMinutes();
            // if (hour < 10) { hour = "0" + hour; }
            // if (min < 10) { min = "0" + min; }
            // var date = "[" + hour + ":" + min + "]";
    
            
            if (data[i] && data[i].message) {
                //set up the date:
                var date;
                
                // console.log(data[i].dateCreated);
                var d;
                if(data[i].dateCreated){
                    d = new Date(data[i].dateCreated);
                }
                else{
                    d = new Date();                        
                }
                var hour = d.getHours();
                var min = d.getMinutes();
                if (hour < 10) { hour = "0" + hour; }
                if (min < 10) { min = "0" + min; }
                date = "[" + hour + ":" + min + "]"; 

                // if(!data[i].dateCreated){
                //     date = "[" + "]";                 
                // }



                var addClass = "";
                var muteSpectators = $(".muteSpecs")[0].checked;
                //if they dont exist in players in room, if game is started, and if mute spectators
                var thisMessageSpectator = false;
                
                //oldSpectators is the var stored in sockets file that 
                //has a list of usernames of spectators
                if(oldSpectators.indexOf(data[i].username) !== -1 && gameStarted === true && muteSpectators === true){
                    //this message is muted. 
                    //dont do anything
                    addClass = "hidden-spectator-chat spectator-chat";
                    thisMessageSpectator = true;
                    
                }
                else{
                    if(oldSpectators.indexOf(data[i].username) !== -1 && gameStarted === true){
                        addClass = "spectator-chat";
                        thisMessageSpectator = true;
                    }
                }

                var muteJoinLeave = $(".mutejoinleave")[0].checked;
                //if they dont exist in players in room, if game is started, and if mute spectators
                var thisMessageJoinLeave = false;
                console.log(data[i].classStr);
                console.log(muteJoinLeave);

                if(data[i].classStr === "server-text-teal" && muteJoinLeave === true){
                    thisMessageJoinLeave = true;
                    addClass += " hidden-spectator-chat";
                    
                }





                //prevent XSS injection
                var filteredMessage = data[i].message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/, "&amp;nbsp;");
                // console.log("Filtered message: " + filteredMessage);
                var str = "";

                // if there is no '[', then the chat incoming is not a quote.
                if(filteredMessage.indexOf("[") === -1){
                    //set the highlight chat if the user has been selected already
                    var highlightChatColour = "";
                // console.log("true?"  + selectedChat[data[i].username]);
                    if (selectedChat[data[i].username] === true) {
                        highlightChatColour = docCookies.getItem("player" + getIndexFromUsername(data[i].username) + 'HighlightColour');
                    }

                    //if its a server text or special text
                    if (data[i].classStr && data[i].classStr !== "") {
                        str = "<li class='" + data[i].classStr + " " + addClass + "'><span class='date-text'>" + date + "</span> " + filteredMessage;
                    }
                    //its a user's chat so put some other stuff on it
                    else {
                        str = "<li class='" + addClass + "'><span style='background-color: " + highlightChatColour + "' username='" + data[i].username + "'><span class='date-text'> " + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + filteredMessage + "</span></li>";
                    }

                    //if they've muted this player, then just dont show anything. reset str to nothing.
                    if(isPlayerMuted(data[i].username) === true){
                        str = "";
                    }

                    $(".room-chat-list").append(str);
                    scrollDown("room-chat-room");
                    scrollDown("room-chat-room2");
                }

                //else if there is a '[' character, then assume the user is quoting a chunk of text
                else{
                    var strings = filteredMessage.split("[");

                    str = "<li class='" + addClass + "'><span username='" + data[i].username + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + "Quoting:" + "</span></li>";

                // console.log("Strings: ");

                    var goFor = strings.length;
                    //only 5 lines of quote at a time max.
                    if(goFor > 6){
                        goFor = 6;
                    }

                    for(var j = 1; j < goFor; j++){
                        str += "<li class='myQuote " + addClass + "'>" + "[" + strings[j] + "</li>";
                    // console.log(strings[j]);
                    }

                    //if they've muted this player, then just dont show anything. reset str to nothing.
                    if(isPlayerMuted(data[i].username) === true){
                        str = "";
                    }

                    $(".room-chat-list").append(str);
                    scrollDown("room-chat-room");
                    scrollDown("room-chat-room2");
                }

                if(thisMessageSpectator === true && muteSpectators === true ){
                    //if the person talking is a spectator, and if mute spectators is checked,
                    //then dont show yellow notification. Otherwise show.
                }
                else if(thisMessageJoinLeave === true && muteJoinLeave === true){
                    //It is a message that is joining or leaving
                }
                else{
                    //yellow notification on the tabs in room.
                    if ($(".nav-tabs #room-chat-in-game-tab").hasClass("active") === false) {
                        $(".nav-tabs #room-chat-in-game-tab")[0].classList.add("newMessage");
                    }
                }
                
            }
        }
    }
}

function isPlayerMuted(username){
    if(mutedPlayers.indexOf(username) !== -1){
        return true;
    }
    else{
        return false;
    }
}

//Remove the new message yellow background colour when
//user selects the tab
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab
    // console.log(target);

    if (target === "#all-chat-in-game" || target === "#all-chat-in-game2") {
        $(".nav-tabs #all-chat-in-game-tab").removeClass("newMessage")
    }
    else if (target === "#room-chat-in-game" || target === "#room-chat-in-game2") {
        $(".nav-tabs #room-chat-in-game-tab").removeClass("newMessage")
    }

    console.log("change tab " + target);

    if($(target).find(".chat-window")[0]){
        scrollDown( $(target).find(".chat-window")[0].id , true);
    }
  

});

//When the player presses the mmute specs button
$(".muteSpecs").on("change", function(e){
    // console.log(e);
    // console.log(e.target.checked);

    var muteButtons = $(".muteSpecs");
    
    for(var i = 0; i < muteButtons.length; i++){
        muteButtons[i].checked = e.target.checked;
    }

    if(e.target.checked === true){
        $(".spectator-chat").addClass("hidden-spectator-chat");
    }
    else{
        $(".spectator-chat").removeClass("hidden-spectator-chat");        
    }

    scrollDown("room-chat-room", true);
    scrollDown("room-chat-room2", true);
});


//When the player presses the mmute specs button
$(".mutejoinleave").on("change", function(e){
    // console.log(e);
    // console.log(e.target.checked);

    var muteButtons = $(".mutejoinleave");
    
    for(var i = 0; i < muteButtons.length; i++){
        muteButtons[i].checked = e.target.checked;
    }

    //Note! Careful here, we only use this server-text-teal class for
    //player joining and leaving so thats why it works
    //if in the future we add more teal server text it will hide those too!
    if(e.target.checked === true){
        $(".server-text-teal").addClass("hidden-spectator-chat");
    }
    else{
        $(".server-text-teal").removeClass("hidden-spectator-chat");        
    }

    scrollDown("room-chat-room", true);
    scrollDown("room-chat-room2", true);
});
