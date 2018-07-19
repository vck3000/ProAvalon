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

    if(data){
        //if it is not an array, force it into a array
        if (data[0] === undefined) {
          // console.log("force array");
            data = [data];
        }  

      // console.log("add to all chat: ");
      // console.log(data);

        for (var i = 0; i < data.length; i++) {
            //format the date
            var d = new Date();
            var hour = d.getHours();
            var min = d.getMinutes();
            if (hour < 10) { hour = "0" + hour; }
            if (min < 10) { min = "0" + min; }
            var date = "[" + hour + ":" + min + "]";
            if(data[i] && data[i].message){
                //prevent XSS injection
                var filteredMessage = data[i].message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/, "&amp;nbsp;");

                var str = "";
                if (data[i].classStr && data[i].classStr !== "") {
                    str = "<li class='" + data[i].classStr + "'><span class='date-text'>" + date + "</span> " + filteredMessage;
                }
                else {
                    str = "<li class='" + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + filteredMessage;
                }

                $(".all-chat-list").append(str);
                scrollDown("all-chat-lobby");
                scrollDown("all-chat-room");
                scrollDown("all-chat-room2");
                

                //yellow notification on the tabs in room.
                if ($(".nav-tabs #all-chat-in-game-tab").hasClass("active") === false) {
                    $(".nav-tabs #all-chat-in-game-tab")[0].classList.add("newMessage"); 
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
            var d = new Date();
            var hour = d.getHours();
            var min = d.getMinutes();
            if (hour < 10) { hour = "0" + hour; }
            if (min < 10) { min = "0" + min; }
            var date = "[" + hour + ":" + min + "]";
    
            
            if (data[i] && data[i].message) {
                var spectatorClass = "";
                if(usernamesOfPlayersInGame.indexOf(data[i].username) === -1 && gameStarted === true){
                    spectatorClass = "spectator-chat";
                }


              // console.log(data[i].message);
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
                        str = "<li class='" + data[i].classStr + "'><span class='date-text'>" + date + "</span> " + filteredMessage;
                    }
                    //its a user's chat so put some other stuff on it
                    else {
                        str = "<li class='" + spectatorClass + "'><span style='background-color: " + highlightChatColour + "' username='" + data[i].username + "'><span class='date-text'> " + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + filteredMessage + "</span></li>";
                    }

                    $(".room-chat-list").append(str);
                    scrollDown("room-chat-room");
                    scrollDown("room-chat-room2");
                }

                //else if there is a '[' character, then assume the user is quoting a chunk of text
                else{
                    var strings = filteredMessage.split("[");

                    str = "<li><span username='" + data[i].username + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + "Quoting:" + "</span></li>";

                  // console.log("Strings: ");

                    for(var j = 1; j < strings.length; j++){
                        str += "<li class='myQuote'>" + "[" + strings[j] + "</li>";
                      // console.log(strings[j]);
                    }

                    $(".room-chat-list").append(str);
                    scrollDown("room-chat-room");
                    scrollDown("room-chat-room2");
                }
                //yellow notification on the tabs in room.
                if ($(".nav-tabs #room-chat-in-game-tab").hasClass("active") === false) {
                    $(".nav-tabs #room-chat-in-game-tab")[0].classList.add("newMessage");
                }
            }
        }
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

  // console.log("change tab " + target);

});