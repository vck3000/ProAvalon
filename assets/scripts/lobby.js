var socket = io({ transports: ['websocket'], upgrade: false });
// console.log("started");

//grab our username from the username assigned by server in EJS file.
var ownUsername = $("#originalUsername")[0].innerText;




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
    // $("#all-chat-lobby")[0].style.height = (newHeight - 10) + "px";
}, 300);




$(document).ready(function(){
    checkStatusBarWithHeight();
})
//if the users screen is big enough, then we can make the center status bar big
function checkStatusBarWithHeight(){
    const cutOffHeight = 850
    if($(window).height() > cutOffHeight){
        $("#status").removeClass("well-sm");
    }
    else{
        $("#status").addClass("well-sm");
    }
}

//when the navbar is closed, re-exted the tab content to bottom.
$('.navbar-collapse').on('hidden.bs.collapse', function () {
    extendTabContentToBottomInRoom();
});

var defaultColours = [
    '#ff6d6d', 
    '#ffff9e',
    "#c5b5ff",
    "#ff9b9b",
    '#9aa888', 
    '#96ff96',
    '##72afac',
    '#a8d6ff',
    '#9999ff',
    '#ff93ff'
]

//When document has loaded, reinit the jscolor
$(document).ready(function() {
    //On first run, update the colours

    for(var i = 0; i < 10; i++){
        if(!docCookies.hasItem('player' + i + "HighlightColour")){
            docCookies.setItem('player' + i + "HighlightColour", defaultColours[i], Infinity);
        }
        $("#player" + i + "HighlightColour")[0].jscolor.fromString(docCookies.getItem('player' + i + "HighlightColour"));
        $("#player" + i + "HighlightColour2")[0].jscolor.fromString(docCookies.getItem('player' + i + "HighlightColour"));
    }
});

function update(picker){
    // picker.attr('col', picker.toHEXString());
    picker.col = picker.toHEXString();
    // console.log(picker.playerColourID);
    // console.log(picker.col);

    docCookies.setItem('player' + picker.playerColourID + "HighlightColour", picker.col, Infinity);

    for(var i = 0; i < 10; i++){
        $("#player" + i + "HighlightColour")[0].jscolor.fromString(docCookies.getItem('player' + i + "HighlightColour"));
        $("#player" + i + "HighlightColour2")[0].jscolor.fromString(docCookies.getItem('player' + i + "HighlightColour"));  
    }
    

    //refresh the chat highlight colour at the same time

    var username = getUsernameFromIndex(picker.playerColourID);
    
  // console.log("Player highlight colour: " + playerHighlightColour);

    //only need to change colour if the user has selected that player's chat.
    if (selectedChat[username] === true) {
        var chatItems = $(".room-chat-list li span[username='" + username + "']");
        var playerHighlightColour = docCookies.getItem("player" + getIndexFromUsername(username) + "HighlightColour");

        chatItems.css("background-color", "" + playerHighlightColour);
    }

    draw();
}





//=======================================================================
//COOKIE SETUP!!!!!! Simple cookies for user options to persist
//=======================================================================
var userOptions = {

    lastSettingsResetDate: {
        defaultValue: new Date().toString(),
        onLoad: function(){},
        initialiseEventListener: function(){}
    },

    optionDisplayFontSize: {
        defaultValue: "14",
        onLoad: function () {
            //get cookie data
            var fontSize = docCookies.getItem("optionDisplayFontSize");

            //set the value in the users display
            $("#option_display_font_size_text")[0].value = fontSize;

            //make the font size changes
            $("html *").css("font-size", fontSize + "px");
            draw();
        },
        initialiseEventListener: function () {
            $("#option_display_font_size_text").on("change", function () {
                var fontSize = $("#option_display_font_size_text")[0].value;
              // console.log(fontSize);

                //assign bounds
                var lowerFontSizeBound = 8;
                var upperFontSizeBound = 25;

                //bound the font size
                if (fontSize < lowerFontSizeBound) {
                    fontSize = lowerFontSizeBound;
                }
                else if (fontSize > upperFontSizeBound) {
                    fontSize = upperFontSizeBound;
                }

                //display the new value in case it was changed by bounds
                $("#option_display_font_size_text")[0].value = fontSize;

                //make the changes to font size
                $("html *").css("font-size", fontSize + "px");
                draw();

                //save the data in cookie
              // console.log("Stored font size: " + fontSize);
                docCookies.setItem("optionDisplayFontSize", fontSize, Infinity);
            });
        }
    },

    optionDisplayHeightOfAvatarContainer: {
        defaultValue: $("#div1Resize").parent().height()*0.5,
        onLoad: function () {
            //get cookie data
            var containerHeight = docCookies.getItem("optionDisplayHeightOfAvatarContainer");

            containerHeight = parseInt(containerHeight);

            //set the height of div 1
            $("#div1Resize").height(containerHeight);
            //Note the following function only adjusts the 2nd div (the div below)
            userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();

            //set the value in the users display
            $("#option_display_avatar_container_height_text")[0].value = containerHeight;
        },
        initialiseEventListener: function () {


            //set up div 1 to be resizable in north and south directions
            $("#div1Resize").resizable({ handles: 's' });
            //on resize of div 1, resize div 2.
            $('#div1Resize').resize(function () {
                //Make the height adjustments
                userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();
                //save the new heights
                docCookies.setItem("optionDisplayHeightOfAvatarContainer", $("#div1Resize").height(), Infinity);
            });
            //on whole window resize, resize both divs.
            $(window).resize(function () {
                $('#div1Resize').width($("#div2Resize").parent().width());

                //save the new heights
                docCookies.setItem("optionDisplayHeightOfAvatarContainer", $("#div1Resize").height(), Infinity);
                //Make the height adjustments
                userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();
                
            });


            $("#option_display_avatar_container_height_text").on("change", function () {
                var containerHeight = $("#option_display_avatar_container_height_text")[0].value;
              // console.log(containerHeight);

                //assign bounds
                var lowerBound = 40;
                var upperBound = 600;

                //bound the font size
                if (containerHeight < lowerBound) {
                    containerHeight = lowerBound;
                }
                else if (containerHeight > upperBound) {
                    containerHeight = upperBound;
                }

                //set the height of div 1 first:
                $("#div1Resize").height(containerHeight);

                //save the new heights
                docCookies.setItem("optionDisplayHeightOfAvatarContainer", containerHeight, Infinity);

                //Make the height adjustments to div 2
                userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();
                
            });
        },

        avatarContainerHeightAdjust: function () {
            $('#div2Resize').height($('#div2Resize').parent().height() - $("#div1Resize").height());

            //extend the tab content to bottom
            extendTabContentToBottomInRoom();
            draw();

            //get cookie data
            var containerHeight = docCookies.getItem("optionDisplayHeightOfAvatarContainer");

            //set the value in the users display
            $("#option_display_avatar_container_height_text")[0].value = containerHeight;
        }
    },

    optionDisplayDarkTheme: {
        defaultValue: "false",
        onLoad: function () {
            if (docCookies.getItem("optionDisplayDarkTheme") === "true") {
              // console.log("Load up dark theme is true");
                //update the dark theme if cookie data is true
                updateDarkTheme(true);
                //show its checked on their screen
                $("#option_display_dark_theme")[0].checked = true;
            }
        },
        initialiseEventListener: function () {
            //dark theme option checkbox event listener
            $("#option_display_dark_theme")[0].addEventListener("click", function () {
                var checked = $("#option_display_dark_theme")[0].checked;
              // console.log("dark theme change " + checked);
                //dark theme
                updateDarkTheme(checked);

                //save their option in cookie
                docCookies.setItem("optionDisplayDarkTheme", checked.toString(), Infinity);
            });
        }
    },

    optionDisplayTwoTabs: {
        defaultValue: "false",
        onLoad: function(){
            if (docCookies.getItem("optionDisplayTwoTabs") === "true") {
                updateTwoTabs(true);
                //show its checked on their screen
                $("#option_display_two_tabs")[0].checked = true;
            }
        },
        initialiseEventListener: function(){
            $("#option_display_two_tabs")[0].addEventListener("click", function () {
                var checked = $("#option_display_two_tabs")[0].checked;
                //dark theme
                updateTwoTabs(checked);

                //save their option in cookie
                docCookies.setItem("optionDisplayTwoTabs", checked.toString(), Infinity);
            });
        }
    },

    //---------------------------------------------
    //Sound Notifications
    //---------------------------------------------
    
    optionNotificationsSoundEnable: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundEnable");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_enable")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_enable")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_enable")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundEnable", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundEnableInGame: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundEnableInGame");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_enable_in_game")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_enable_in_game")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_enable_in_game")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundEnableInGame", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundVolume: {
        defaultValue: "50",
        onLoad: function(){
            //get cookie data
            var volume = docCookies.getItem("optionNotificationsSoundVolume");

            //set the value in the users display
            $("#option_notifications_sound_volume")[0].value = volume;   
            
            //update the number when slider changes
            var volumeSlider = document.getElementById("option_notifications_sound_volume");
            var volumeDisplay = $("#volumeValue");

            volumeDisplay[0].innerHTML = volumeSlider.value;


        
            volumeSlider.oninput = function(){
                volumeDisplay[0].innerHTML = volumeSlider.value;
            };
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_volume")[0].addEventListener("click", function () {
                var valueToStore = $("#option_notifications_sound_volume")[0].value;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundVolume", valueToStore, Infinity);
            });
        }
    },
    

    optionNotificationsSoundPlayersJoiningRoom: {
        defaultValue: "false",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundPlayersJoiningRoom");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_players_joining_room")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_players_joining_room")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_players_joining_room")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundPlayersJoiningRoom", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundPlayersJoiningGame: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundPlayersJoiningGame");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_players_joining_game")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_players_joining_game")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_players_joining_game")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundPlayersJoiningGame", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundGameStarting: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundGameStarting");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_game_starting")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_game_starting")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_game_starting")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundGameStarting", checked.toString(), Infinity);
            });
        }
    },



    optionNotificationsSoundYourTurn: {
        defaultValue: "false",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundYourTurn");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_your_turn")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_your_turn")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_your_turn")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundYourTurn", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundGameEnding: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundGameEnding");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_game_ending")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_game_ending")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_game_ending")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundGameEnding", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundBuzz: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundBuzz");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_buzz")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_buzz")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_buzz")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundBuzz", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundSlap: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsSoundSlap");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_sound_slap")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_sound_slap")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_sound_slap")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundSlap", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsSoundBuzzSlapTimeout: {
        defaultValue: "15",
        onLoad: function(){
            //get cookie data
            var seconds = docCookies.getItem("optionNotificationsSoundBuzzSlapTimeout");

            //set the value in the users display
            $("#option_notifications_buzz_slap_timeout")[0].value = seconds;
            
        },
        initialiseEventListener: function() {
            $("#option_notifications_buzz_slap_timeout")[0].addEventListener("click", function () {
                var valueToStore = $("#option_notifications_buzz_slap_timeout")[0].value;
                //save their option in cookie
                docCookies.setItem("optionNotificationsSoundBuzzSlapTimeout", valueToStore, Infinity);
            });
        }
    },

    //---------------------------------------------
    //Desktop notifications
    //---------------------------------------------
    optionNotificationsDesktopEnable: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopEnable");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_enable")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_enable")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_enable")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopEnable", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopPlayersJoiningRoom: {
        defaultValue: "false",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopPlayersJoiningRoom");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_players_joining_room")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_players_joining_room")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_players_joining_room")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopPlayersJoiningRoom", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopPlayersJoiningGame: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopPlayersJoiningGame");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_players_joining_game")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_players_joining_game")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_players_joining_game")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopPlayersJoiningGame", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopGameStarting: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopGameStarting");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_game_starting")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_game_starting")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_game_starting")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopGameStarting", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopYourTurn: {
        defaultValue: "false",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopYourTurn");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_your_turn")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_your_turn")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_your_turn")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopYourTurn", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopGameEnding: {
        defaultValue: "false",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopGameEnding");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_game_ending")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_game_ending")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_game_ending")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopGameEnding", checked.toString(), Infinity);
            });
        }
    },

    optionNotificationsDesktopBuzz: {
        defaultValue: "true",
        onLoad: function(){
            var checked;
            var savedSetting = docCookies.getItem("optionNotificationsDesktopBuzz");
            if(savedSetting === "true"){
                checked = true;
            }
            else if(savedSetting === "false"){
                checked = false;
            }
            $("#option_notifications_desktop_buzz")[0].checked = checked;
        },
        initialiseEventListener: function() {
            $("#option_notifications_desktop_buzz")[0].addEventListener("click", function () {
                var checked = $("#option_notifications_desktop_buzz")[0].checked;
                //save their option in cookie
                docCookies.setItem("optionNotificationsDesktopBuzz", checked.toString(), Infinity);
            });
        }
    },
    
}

//run through each userOption load and initialiseEventListener
//create the default values if the cookie doesn't have the option stored.
for (var keys in userOptions) {
    if (userOptions.hasOwnProperty(keys)) {
        //if the option doesnt exist, create default option
        if (docCookies.hasItem(keys) === false) {
            docCookies.setItem(keys, userOptions[keys].defaultValue, Infinity);
        }

        //run the load function for each option
        userOptions[keys].onLoad();
        //run the initialise event listener function for each option
        userOptions[keys].initialiseEventListener();

    }
}



//for the game
var roomPlayersData;
var roomSpectatorsData;
var seeData;
var gameData;
var roomId;
var gameStarted = false;

var inRoom = false;

var isSpectator = false;

//window resize, repaint the users
window.addEventListener('resize', function () {
  // console.log("Resized");
    checkStatusBarWithHeight();
    draw();
});


//======================================
//BUTTON EVENT LISTENERS
//======================================
document.querySelector("#green-button").addEventListener("click", greenButtonFunction);
document.querySelector("#red-button").addEventListener("click", redButtonFunction);

//re-draw the game screen when the modal is closed to update the roles in the center well.
$('#roleOptionsModal').on('hidden.bs.modal', function (e) {
    draw();
    console.log("test");
})

// Set the event listener for the button
$("#kickButton")[0].addEventListener("click", function () {
    var players = getKickPlayers();

    //kick the selected players one by one
    for (var key in players) {
        if (players.hasOwnProperty(key)) {
            socket.emit("kickPlayer", key);
          // console.log("kick player: " + key);
        }
    }
});

//new ROOM CODE
document.querySelector("#newRoom").addEventListener("click", function () {
    if (inRoom === false) {
        socket.emit("newRoom");
      // console.log("RESET GAME DATA ON CREATE ROOM");
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
    document.querySelector("#success-alert-box-buttofn").classList.add("inactive-window");
});

document.querySelector("#backButton").addEventListener("click", function () {
    changeView();
    socket.emit("leave-room", "");

    console.log("LEAVE");
    resetAllGameData();
});

document.querySelector("#claimButton").addEventListener("click", function () {
    //INCOMPLETE
    socket.emit("claim", "");

    if($("#claimButton")[0].innerText === "Claim"){
        $("#claimButton")[0].innerText = "Unclaim";
    }
    else{
        $("#claimButton")[0].innerText = "Claim";
    }
});

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
});

socket.on("joinedGameSuccess", function(data){
    isSpectator = false;
});

socket.on('disconnect', function(){
    window.location= "/";
    alert("You have been disconnected!");
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
        // resetSettings();
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
        <li>In order for me to update the site, the server must be restarted. </li>

        <li>Any running games will be saved and you will be able to continue your games when you log in again.</li>

        <li>The server will only be down for a brief moment, at most 30 seconds.</li>

        <li>When you rejoin please use /roomChat to recover your chat.</li>

        <li>I apologise for the inconvenience caused. Thank you.</li>
    </ul>
    
    </div>`;

    Swal({
        title: "Server restarting!",
        html: message,
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
    
        for (var i = 0; i < data.length; i++) {
            //format the date
            var d = new Date();
            var hour = d.getHours();
            var min = d.getMinutes();
            if (hour < 10) { hour = "0" + hour; }
            if (min < 10) { min = "0" + min; }
            var date = "[" + hour + ":" + min + "]";
    
            
            if (data[i] && data[i].message) {
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
                        str = "<li><span style='background-color: " + highlightChatColour + "' username='" + data[i].username + "'><span class='date-text'> " + date + "</span> <span class='username-text'>" + data[i].username + ":</span> " + filteredMessage + "</span></li>";
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

socket.on("update-current-players-list", function (currentPlayers) {
  // console.log("update the current player list request received");
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
            var str = "<tr> <td> " + currentGame.roomId + ": " + currentGame.status + " " + currentGame.numOfPlayersInside + "/10 <span style='padding-left: 10px;'>Spec: " + currentGame.numOfSpectatorsInside + "</span><p>Host: " + currentGame.hostUsername + "</p>" + "</td> </tr>";
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

socket.on("auto-join-room-id", function (roomId_) {
  // console.log("auto join room");
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
    if($("#option_notifications_sound_slap")[0].checked === true){
        if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
            playSound("slap");
            
            timeLastBuzzSlap = new Date();

            var data = { message: "You have been slapped by " + username + ".", classStr: "server-text"}
            setTimeout(function () {
                addToAllChat(data);
                addToRoomChat(data);
            }, 1100);
        }
    }

});

socket.on("buzz", function (username) {
    
    if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
        if($("#option_notifications_sound_buzz")[0].checked === true){
            playSound("ding");

            var data = { message: "You have been buzzed by " + username + ".", classStr: "server-text"}
            setTimeout(function () {
                addToAllChat(data);
                addToRoomChat(data);
            }, 0);
        }

        if($("#option_notifications_desktop_buzz")[0].checked === true){
            displayNotification(username + " has buzzed you!", "", "avatars/base-spy.png", "buzz");
        }
    }
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

    //if an extra person joins the game, play the chime
    if(roomPlayersData && roomPlayersData.length < data.playersJoined.length && data.playersJoined.length > 1){
        if($("#option_notifications_sound_players_joining_game")[0].checked === true){
            playSound('ding');
        }
        
        if($("#option_notifications_desktop_players_joining_game")[0].checked === true){
            displayNotification("New player in game!  [" + (data.playersJoined.length) + "p]", data.playersJoined[data.playersJoined.length - 1].username + " has joined the game!", "avatars/base-res.png", "newPlayerInGame");
        }
    }

    //if an extra person joins the room
    if(roomSpectatorsData && roomSpectatorsData.length < data.spectators.length){
        if($("#option_notifications_sound_players_joining_room")[0].checked === true){
            playSound('highDing');
        }

        if($("#option_notifications_desktop_players_joining_room")[0].checked === true && data.spectators[data.spectators.length - 1] !== ownUsername){
            displayNotification("New player in room.", data.spectators[data.spectators.length - 1] + " has joined the room.", "avatars/base-res.png", "newPlayerInRoom");
        }
    }

    // var x = $("#typehead").parent().width();    
    roomPlayersData = data.playersJoined;
    roomSpectatorsData = data.spectators;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

  // console.log("update room players");
    // console.log(data);

    //update spectators list
    updateSpectatorsList();
    draw();
});

//======================================
//GAME SOCKET ROUTES
//======================================
socket.on("game-starting", function (roles) {
    

    if($("#option_notifications_sound_game_starting")[0].checked === true){
        playSound("dingDingDing");
    }

    if($("#option_notifications_desktop_game_starting")[0].checked === true){
        displayNotification("Game starting!", "Are you ready?", "avatars/base-spy.png", "gameStarting");
    }

    var secondsLeft = 10;
    let timerInterval;

    Swal({
        title: "Game is starting!",
        html: "<strong></strong> seconds left. <br><br>Roles are: " + roles,
        type: "info",
        confirmButtonText: "Ready",
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "Not ready",
        allowOutsideClick: false,
        allowEnterKey: false,
        reverseButtons: true,
        
        timer: 10000,

        onOpen: () => {
            // swal.showLoading()
            timerInterval = setInterval(() => {
              swal.getContent().querySelector('strong')
                .textContent = Math.floor(swal.getTimerLeft()/1000)
            }, 100)
          },
          onClose: () => {
            clearInterval(timerInterval)
          }

    }).then(function (result) {
        console.log(result)
        if (result.dismiss === swal.DismissReason.timer || result.dismiss === swal.DismissReason.cancel) {
            console.log('I was closed by the timer')
            socket.emit("player-not-ready", ownUsername);
          }
          else{
            console.log('Im ready!')
            socket.emit("player-ready", ownUsername);
          }
    });
});

socket.on("spec-game-starting", function(data){
    Swal({
        title:"A game is starting!",
        text: "You cannot join the game unless someone is not ready.",
        type: "info",
        allowEnterKey: false
    });

    // document.querySelector("#green-button").classList.contains("disabled")

    $("#green-button").addClass("disabled");
});

socket.on("spec-game-starting-finished", function(data){
    $("#green-button").removeClass("disabled");
});


socket.on("game-data", function (data) {
    console.log("GAME DATA INC");   
    console.log(data);
    if (data && roomId === data.roomId) {
      // console.log("game starting!");

        // console.log(data);
        gameData = data;

        //if the game has only just started for the first time, display your role
        if(gameStarted === false){
            if(gameData.alliance){
                var str = "You are a " + gameData.alliance + ". Your role is " + gameData.role + ".";
                data = {
                    classStr: "server-text",
                    message: str
                }
                addToRoomChat(data);
            }

            if($("#option_notifications_sound_game_starting")[0].checked === true){
                // playSound("game-start");
            }
        }

        gameStarted = true;

        //hide the options cog
        document.querySelector("#options-button").classList.add("hidden");
        //remove the kick modal from redbutton
        $("#red-button").removeAttr("data-target");
        $("#red-button").removeAttr("data-toggle");

        isSpectator = gameData.spectator;

        drawVoteHistory(gameData);
        draw();
    }
});

socket.on("lady-info", function (message) {
    var str = message + " (this message is only shown to you)";
    var data = { message: str, classStr: "special-text noselect" };

    addToRoomChat(data);
});

socket.on("update-status-message", function (data) {
    if (data) {
        $("#status").textContent = data;
    }
});

//======================================
//FUNCTIONS
//======================================

function redButtonFunction() {
    if (document.querySelector("#red-button").classList.contains("disabled") === false) {
        if (isSpectator === true) {

        }
        else if (gameStarted === false) {
            // Set the kick modal content
            var str = "<h4>Select the players you want to kick.</h4>";

            str += '<div class="btn-group-vertical" data-toggle="buttons">';

            for (var i = 0; i < roomPlayersData.length; i++) {
                str += '<label class="btn btn-mine">';

                str += '<input name="' + roomPlayersData[i].username + '" id="' + roomPlayersData[i].username + '" type="checkbox" autocomplete="off">' + roomPlayersData[i].username;

                str += "</label>";
                str += "<br>";
            }

            str += '</div>';

            $("#kickModalContent")[0].innerHTML = str;
        }
        else {
            if (gameData.phase === "voting") {
              // console.log("Voted reject");
                socket.emit("pickVote", "reject");
            }
            else if (gameData.phase === "missionVoting") {
              // console.log("Voted fail");


                if (gameData.alliance === "Resistance") {
                  // console.log("You aren't a spy! You cannot fail a mission!");
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
        }
        else if (gameStarted === false) {
            socket.emit("startGame", getOptions());
        }
        else {
            if (gameData.phase === "picking") {
                var arr = getHighlightedAvatars();
              // console.log(arr);
                socket.emit("pickedTeam", arr);
            }
            else if (gameData.phase === "voting") {
              // console.log("Voted approve");
                socket.emit("pickVote", "approve");
            }
            else if (gameData.phase === "missionVoting") {
              // console.log("Voted succeed");
                socket.emit("missionVote", "succeed");
            }
            else if (gameData.phase === "assassination") {
              // console.log("Assasinate!!!");
                socket.emit("assassinate", getHighlightedAvatars());
            }
            else if (gameData.phase === "lady") {
              // console.log("Lady: " + getHighlightedAvatars()[0]);
                socket.emit("lady", getHighlightedAvatars()[0]);
            }

        }
    }
}


function draw() {
  // console.log("draw called");
    if (roomPlayersData) {
        drawAndPositionAvatars();

        drawTeamLeaderStar();

        drawMiddleBoxes();
        scaleMiddleBoxes();

        drawClaimingPlayers(roomPlayersData.claimingPlayers);

        
        if (gameStarted === true) {
            drawExitedPlayers(gameData.gamePlayersInRoom);

            //default greyed out rn
            enableDisableButtons();

            $("#missionsBox").removeClass("invisible");

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

                var str = "";

                //show the remaining players who haven't voted if we have voted
                if (gameData.playersYetToVote.indexOf(ownUsername) === -1) {
                    str += "Waiting for votes: ";

                    for (var i = 0; i < gameData.playersYetToVote.length; i++) {
                        str = str + gameData.playersYetToVote[i] + ", ";
                    }
                }
                else {
                    //change the well to display what was picked.
                    str += (getUsernameFromIndex(gameData.teamLeader) + " has picked: ");

                    for (var i = 0; i < gameData.proposedTeam.length; i++) {
                        str += gameData.proposedTeam[i] + ", ";
                    }

                }

                //remove the last , and replace with .
                str = str.slice(0, str.length - 2);
                str += ".";


                document.querySelector("#status").innerText = str;
            }

            else if (gameData.phase === "missionVoting") {
                //show the remaining players who haven't voted
                var str = "Waiting for mision votes: ";

                for (var i = 0; i < gameData.playersYetToVote.length; i++) {
                    str = str + gameData.playersYetToVote[i] + ", ";
                }

                //remove the last , and replace with .
                str = str.slice(0, str.length - 2);
                str += ".";

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
                    if(gameData.assassin){
                        document.querySelector("#status").innerText = "Waiting for " + gameData.assassin + " to shoot.";
                    }
                    else{
                        document.querySelector("#status").innerText = "Waiting for assassin to shoot.";
                    }
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

                //remove the last , and replace with .
                str = str.slice(0, str.length - 2);
                str += ".";

                document.querySelector("#status").innerText = "Current roles: " + str;
            }
            else {
                document.querySelector("#status").innerText = "Waiting for game to start... ";
            }
            enableDisableButtons();
        }

        activateAvatarButtons();
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

    // console.log("added " + highlightButtons.length + " many listeners for highlightbuttons");

    for (var i = 0; i < highlightButtons.length; i++) {
        // console.log(i);

        highlightButtons[i].addEventListener("click", function () {
            // //toggle the highlight class
            // var divs = document.querySelectorAll("#mainRoomBox div");
            // var uniqueNum = i;
          // console.log("click for highlight avatar");

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
          // console.log("Selected avatars num: " + selectedAvatars[username])
            draw();
        });
    }



    var highlightChatButtons = document.querySelectorAll("#mainRoomBox div #highlightChatButton");
    //add the event listeners for button press
    for (var i = 0; i < highlightChatButtons.length; i++) {
        highlightChatButtons[i].addEventListener("click", function () {
            // //toggle the highlight class
          // console.log("click for highlight chat");

            var username = this.parentElement.parentElement.getAttribute("usernameofplayer");
            var chatItems = $(".room-chat-list li span[username='" + username + "']");

            var playerHighlightColour = docCookies.getItem("player" + getIndexFromUsername(username) + "HighlightColour");
            
          // console.log("Player highlight colour: " + playerHighlightColour);

            if (selectedChat[username] === true) {
                selectedChat[username] = false;
                chatItems.css("background-color", "transparent");
            }
            else {
              // console.log("set true");
                selectedChat[username] = true;
                chatItems.css("background-color", "" + playerHighlightColour);
            }
            draw();
        });
    }
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
            if(votes[i] === "approve"){
                $($("#mainRoomBox div")[i]).find(".approveLabel").removeClass("invisible");
            }
            if(votes[i] === "reject"){
                $($("#mainRoomBox div")[i]).find(".rejectLabel").removeClass("invisible");
            }
            // document.querySelectorAll("#mainRoomBox div")[i].classList.add(votes[i]);
        }
    }
    else {
        for (var i = 0; i < divs.length; i++) {
            // document.querySelectorAll("#mainRoomBox div")[i].classList.remove("approve");
            // document.querySelectorAll("#mainRoomBox div")[i].classList.remove("reject");

            $($("#mainRoomBox div")[i]).find(".approveLabel").addClass("invisible");
            $($("#mainRoomBox div")[i]).find(".rejectLabel").addClass("invisible");
        }
    }
}


function assassinationSetup(phase) {
    if (phase === "assassination") {
        var divs = document.querySelectorAll("#mainRoomBox div");
        //add the event listeners for button press
        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function () {
              // console.log("avatar pressed");
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
              // console.log("avatar pressed");
                //toggle the highlight class
                this.classList.toggle("highlight-avatar");
                //change the pick team button to enabled/disabled
                enableDisableButtonsLeader(numPlayersOnMission);
            });
        }
        enableDisableButtonsLeader(numPlayersOnMission);
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
                  // console.log("avatar pressed");
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

    var numPlayers = roomPlayersData.length;//3;

    //generate the divs in the html
    var str = "";
  // console.log("Game started: " + gameStarted);
    if (gameStarted === true) {
        //draw the players according to what the client sees (their role sees)
        for (var i = 0; i < numPlayers; i++) {
            //check if the user is on the spy list. 
            //if they are not, they are res
            if (gameData.see.spies && gameData.see.spies.indexOf(roomPlayersData[i].username) === -1) {
                str = str + strOfAvatar(roomPlayersData[i], "res");
            }
            //else they are a spy
            else {
                str = str + strOfAvatar(roomPlayersData[i], "spy");
            }
        }
    }
    //when game has not yet started, everyone is a res image
    else {
        for (var i = 0; i < numPlayers; i++) {
            str = str + strOfAvatar(roomPlayersData[i], "res");
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
    const scaleWidthDown = 0.9;
    const scaleHeightDown = 1;
    var playerLocations = generatePlayerLocations(numPlayers, (w / 2)*scaleWidthDown, (h / 2)*scaleHeightDown);

    for (var i = 0; i < numPlayers; i++) {
        // console.log("player position: asdflaksdjf;lksjdf");
        var offsetX = w / 2;
        var offsetY = h / 2;
        
        //reduce the height so that the bottom of avatars dont crash into the bottom.
        offsetY = offsetY * 1;

      // console.log("offsetY: " + offsetY);


        //scale the height of avatars
        var windowH = $(window).height();
        var windowW = $(window).width();

        var strX = playerLocations.x[i] + offsetX + "px";
        var strY = playerLocations.y[i] + offsetY - windowH * 0.01 + "px";

        divs[i].style.left = strX;
        divs[i].style.bottom = strY;

        var ratioXtoY = 0.8;

        divs[i].style.height = 37 + "%";
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

function drawClaimingPlayers(claimingPlayers){

    for(var i = 0; i < roomPlayersData.length; i++){
        if(roomPlayersData[i].claim && roomPlayersData[i].claim === true){
            if ($("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)]) {
                var str = $("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)].innerHTML;
                str = str + "<span><img src='pictures/claim.png' class='claimIcon'></span>";
                //update the str in the div
                $("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)].innerHTML = str;
        
                // $(".claimIcon")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
            }
        }
    }

}

function drawExitedPlayers(playersStillInRoom){

    var arrayOfUsernames = []
    for(var i = 0; i < roomPlayersData.length; i++){
        arrayOfUsernames.push(roomPlayersData[i].username);
    }


    for(var i = 0; i < arrayOfUsernames.length; i++){
        // if(roomPlayersData[i].claim && roomPlayersData[i].claim === true){
        if(playersStillInRoom.indexOf(arrayOfUsernames[i]) === -1){

            // var j = playersStillInRoom.indexOf(arrayOfUsernames[i]);

            // if ($("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])]) {
            //     var str = $("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])].innerHTML;
            //     str = str + "<span><img src='pictures/leave.png' class='leaveIcon'></span>";
            //     //update the str in the div
            //     $("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])].innerHTML = str;
        
            //     // $(".claimIcon")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
            // }


            if ($(".avatarImgInRoom")[getIndexFromUsername(arrayOfUsernames[i])]) {
                $(".avatarImgInRoom")[getIndexFromUsername(arrayOfUsernames[i])].classList.add("leftRoom");
            }
        }
        else{
            if ($(".avatarImgInRoom")[getIndexFromUsername(arrayOfUsernames[i])]) {
                $(".avatarImgInRoom")[getIndexFromUsername(arrayOfUsernames[i])].classList.remove("leftRoom");
            }
        }
    }

}

function enableDisableButtonsLeader(numPlayersOnMission) {
    //if they've selected the right number of players, then allow them to send
    // console.log("countHighlightedAvatars: " + countHighlightedAvatars());
    // console.log("numPlayersOnMission: " + numPlayersOnMission);
    if (countHighlightedAvatars() == numPlayersOnMission || (countHighlightedAvatars() + "*") == numPlayersOnMission) {
        document.querySelector("#green-button").classList.remove("disabled");
        document.querySelector("#green-button").classList.remove("faded");
    }
    else {
        document.querySelector("#green-button").classList.add("disabled");
        document.querySelector("#green-button").classList.add("faded");
        
    }
}
function enableDisableButtons() {
    //reset the faded class for the buttons
    document.querySelector("#green-button").classList.remove("faded");

    
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
    if (roomPlayersData) {
        for (var i = 0; i < roomPlayersData.length; i++) {
            if (roomPlayersData[i].username === username) {
                return i;
            }
        }
    }
    else {
        return false;
    }

}

function getUsernameFromIndex(index) {
    if (roomPlayersData[index]) {
        return roomPlayersData[index].username;
    }
    else {
        return false;
    }
}

function strOfAvatar(playerData, alliance) {
    var picLink;
    if (alliance === "res") {
        if (playerData.avatarImgRes) {

            if(playerData.avatarImgRes.includes("http")){
                picLink = playerData.avatarImgRes;
            }
            else{
                //stored locally, need to add the path to it
                picLink = 'avatars/' + playerData.avatarImgRes;
            }
            
        } else {
            picLink = 'avatars/base-res.png'
        }
    }
    else {
        if (playerData.avatarImgSpy) {

            if(playerData.avatarImgSpy.includes("http")){
                picLink = playerData.avatarImgSpy;
            }
            else{
                //stored locally, need to add the path to it
                picLink = 'avatars/' + playerData.avatarImgSpy;
            }

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

    str += '<span class="label label-success invisible approveLabel">Approve</span>';
    str += '<span class="label label-danger invisible rejectLabel">Reject</span>';


    str += "<img class='avatarImgInRoom' src='" + picLink + "'>";
    str += "<p class='username-p'>" + lady + "" + playerData.username + " " + hammerStar + " </p>" + role + "</div>";


    return str;
}

function changeView() {
    $(".lobby-container").toggleClass("inactive-window");
    $(".game-container").toggleClass("inactive-window");

    extendTabContentToBottomInRoom();


    setTimeout(function(){
        console.log("redraw");
        draw();
    }, 1000);
}

// var chatBoxToNavTab = {
//     "all-chat-lobby": "",
//     "all-chat-room": "All Chat",
//     "room-chat-room": "Game Chat"
// }

function scrollDown(chatBox) {
    //example input of chatBox: all-chat-room

    var searchStrScrollBox = "#" + chatBox;
    var searchStrListBox = "#" + chatBox + "-list";

    var scrollBox = $(searchStrScrollBox);
    var listBox = $(searchStrListBox);

    var searchStrBar = "#" + chatBox + "-bar";

    const cutOffPixelsToScroll = 20;

    // console.log("diff is " + (listBox.height() - scrollBox.scrollTop() - scrollBox.height()) );

    //if the user is scrolled away

    var heightOfLastMessage = listBox.children().last().height();

    var lastMessages = listBox.children();
    var lastMessage = lastMessages[lastMessages.length-1];

    var i = lastMessages.length-1 - 1;
    while(lastMessage.classList.contains("myQuote")){
        lastMessage = lastMessages[i];
        i--;
    }

    heightOfLastMessage = ((lastMessages.length-1) - i)*20;

  // console.log("Height: " + heightOfLastMessage);


    if((listBox.height() - scrollBox.scrollTop() - scrollBox.height()) > 5 + heightOfLastMessage){
        //Show user that there is a new message with the red bar.
        //Show because the only time this will trigger is when a new message comes in anyway
        $(searchStrBar).removeClass("hidden");
    }
    else {
        scrollBox.scrollTop(listBox.height());
        $(searchStrBar).addClass("hidden");
    }

    // //if the chatbox is not open make the red bar visible since there is a new message
    // if(chatBoxToNavTab[chatBox] !== "" && $('.nav-tabs .active').text() !== chatBoxToNavTab[chatBox]){
    //     $(searchStrBar).removeClass("hidden");
    // }
}

var arrayOfChatBoxes = [
    "#all-chat-lobby",
    "#all-chat-room",
    "#room-chat-room",
    "#all-chat-room2",
    "#room-chat-room2"
]

for(var i = 0; i < arrayOfChatBoxes.length; i++){
    var chatBoxToEvent = arrayOfChatBoxes[i];

  // console.log("Chatbox is: " + chatBoxToEvent);

    $(chatBoxToEvent).on("scroll", function(){
        chatBox = "#" + this.id;
        checkUnreadMessagesBar(chatBox);
    });
}

function checkUnreadMessagesBar(chatBox){
  // console.log("chatbox : " + chatBox);

    var searchStrScrollBox = "" + chatBox;
    var searchStrListBox = "" + chatBox + "-list";
    var searchStrBar = "" + chatBox + "-bar";

    var scrollBox = $(searchStrScrollBox);
    var listBox = $(searchStrListBox);

    // console.log("SCROLL");
  // console.log("IF: " + !(listBox.height() - scrollBox.scrollTop() - scrollBox.height() > 20));

    //if user is at the bottom
    if(!(listBox.height() - scrollBox.scrollTop() - scrollBox.height() > 20)){
        $(searchStrBar).addClass("hidden");
    }
}

// This bit was for updating the red bar when a person comes back into the tab
// but its too hard to implement rn so no need rn.
// $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
//     var target = $(e.target).attr("href") // activated tab

//   // console.log($(target));


//     var chatBox = "#" + $(target)[0].childNodes[1].id;
//   // console.log(chatBox);
//     // console.log(e);
//   });



function toRadians(angle) {
    return angle * (Math.PI / 180);
}

//some setups result in collisions of avatars
//so set up some custom degree positions for avatars at certain 
//game sizes

//key = num of players in game
//2nd key = player position
//value = angle
var customSteps = {

    7: {
        1: 35,
        6: 325
    },
    8: {
        1: 30,

        3: 145,
        5: 215,

        7: 330
    },
    9: {
        1: 30,
        2: 70,
        3: 140,
        4: 167,

        5: 193,
        6: 220,
        7: 290,
        8: 330

    },
    10: {
        0: 13,
        1: 40,
        2: 90,
        3: 140,
        4: 167,

        5: 193,
        6: 220,
        7: 270,
        8: 320,
        9: 347

    }
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
    if (numOfPlayers === 6) {
        var tiltOffset = step / 2;
    }

    for (var i = 0; i < numOfPlayers; i++) {
        if(customSteps[numOfPlayers] && customSteps[numOfPlayers][i]){
            x_[i] = a * (Math.cos(toRadians((customSteps[numOfPlayers][i]) + 90 + tiltOffset))) * 0.85;
            y_[i] = b * (Math.sin(toRadians((customSteps[numOfPlayers][i]) + 90 + tiltOffset))) * 0.7;
        }
        else{
            //get the coordinates. Note the +90 is to rotate so that
            //the first person is at the top of the screen
            x_[i] = a * (Math.cos(toRadians((step * i) + 90 + tiltOffset))) * 0.85;
            y_[i] = b * (Math.sin(toRadians((step * i) + 90 + tiltOffset))) * 0.7;
            // x_[i] = a*(Math.cos(toRadians((step*i) + 90)));
            // y_[i] = b*(Math.sin(toRadians((step*i) + 90)));
        }


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
        str += "<td style='width: 11em;' colspan='' class='missionHeader" + (i + 1) + "'>Mission " + (i + 1) + "</td>";
    }
    str += "</tr>";

    var keyArray = [];
    //push the first person first
    keyArray[0] = (roomPlayersData[0].username);

    //for every username in a clockwise direction
    for (var i = roomPlayersData.length-1; i > 0; i--){
        keyArray[roomPlayersData.length - i] = (roomPlayersData[i].username);
      // console.log("Push: " + roomPlayersData[i].username);
      // console.log("i: " + i);
    } 
    
  // console.log("key array:" );
  // console.log(keyArray);


    // for(var k = keyArray.length - 1; k >= 0; k--){
    for(var k = 0; k < keyArray.length; k++){
        // console.log(key + " -> " + data.voteHistory[key]);
        str += "<tr>";
        //print username in the first column
        str += "<td>" + keyArray[k] + "</td>";

        //Individual mission voteHistory
        //for every mission
        for (var i = 0; i < data.voteHistory[keyArray[k]].length; i++) {
            numOfPicksPerMission[i] = 0;

            //for every pick
            for (var j = 0; j < data.voteHistory[keyArray[k]][i].length; j++) {
                // console.log(data.voteHistory[key][i][j]);

                str += "<td class='" + data.voteHistory[keyArray[k]][i][j] + "''>";

                if(data.voteHistory[keyArray[k]][i][j].includes("VHpicked") === true){
                    str += "<i class='glyphicon glyphicon-ok'></i>";
                }

                str += "</td>";
                numOfPicksPerMission[i]++;
            }
        }
        str += "</tr>"; 
    }

    $(".voteHistoryTableClass")[0].innerHTML = str;
    $(".voteHistoryTableClass")[1].innerHTML = str;

    //set the right colspans for the mission headers
    for (var i = 0; i < numOfPicksPerMission.length; i++) {
        var id = ".missionHeader" + (i + 1);

        var allHeaders = $(id);
    
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

    for (var i = 0; i < roomPlayersData.length; i++) {
      // console.log(unescapeHtml(roomPlayersData[i].username));
        // if ($("#" + roomPlayersData[i].username)[0].checked === true) {
        if ($("#" + $.escapeSelector(unescapeHtml(roomPlayersData[i].username)))[0].checked === true) {
            data[roomPlayersData[i].username] = true;
        }
    }

    return data;
}


var gameEndSoundPlayed = false;
function resetAllGameData() {
    roomId = undefined;
    //reset all the variables
    roomPlayersData = undefined;
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

    //reset the vh table
    $("#voteHistoryTable")[0].innerHTML = "";

    $("#missionsBox").addClass("invisible");
    
}

var tempVar = 0;

function extendTabContentToBottomInRoom() {
    //extending the tab content to the bottom of the page:
    var gameContainer = $(".game-container")[0];
    var tabNumber = $("#tabs1");
    var tabContainer = $(".tab-content");
    var navTabs = $(".nav-tabs");

    var newHeight2 = Math.floor(gameContainer.offsetHeight - tabNumber.position().top) - 20;
  // console.log("new height 2: " + newHeight2);

    tabNumber[0].style.height = Math.floor((newHeight2 * 1) - tempVar) + "px";

    tabContainer.height(Math.floor(newHeight2 /*- navTabs.height()*/) + "px");
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
      // console.log("COMMAND INPUT DETECTED");
        var validCommandFound = false;

        //need to change this to only up to the first space
        messageCommand = arrayMessage[0].slice(1, arrayMessage[0].length);

        var commandCalled = "";

        //cycle through the commands and try to find the command.
        for (var key in commands) {
            if (commands.hasOwnProperty(key)) {
                // console.log(key + " -> " + commands[key]);
                if (messageCommand === commands[key].command) {

                  // console.log("Command: " + commands[key].command + " called.");
                    commandCalled = commands[key].command;
                    validCommandFound = true;

                    if(commands[key].command === "roomChat"){
                        //reset room chat
                        $(".room-chat-list").html("");
                    }
                    else if(commands[key].command === "allChat"){
                        //reset all chat
                        $(".all-chat-list").html("");
                    }

                    break;
                }
            }
        }

        if(modCommands){
            for (var key in modCommands) {
                if (modCommands.hasOwnProperty(key)) {
                    // console.log(key + " -> " + commands[key]);
                    if (messageCommand === modCommands[key].command) {
                        console.log("mods");
                      // console.log("Command: " + commands[key].command + " called.");
                        commandCalled = modCommands[key].command;
                        validCommandFound = true;
    
                        break;
                    }
                }
            }
        }

        if(adminCommands){
            for (var key in adminCommands) {
                if (adminCommands.hasOwnProperty(key)) {
                    // console.log(key + " -> " + commands[key]);
                    if (messageCommand === adminCommands[key].command) {
                        console.log("admin");
                        // console.log("Command: " + commands[key].command + " called.");
                        commandCalled = adminCommands[key].command;
                        validCommandFound = true;
    
                        break;
                    }
                }
            }
        }

        if (validCommandFound === false) {
          // console.log("Command invalid");
            var str = "/"+ messageCommand + " is not a valid command. Type /help for a list of commands."; 
            var data = { 
                message: str,
                classStr: "server-text"
            }
            if (chatBox === "allChat") {
                addToAllChat(data);
            }
            else if (chatBox === "roomChat") {
                addToRoomChat(data);
            }
        }
        else {
            //sending command to server
          // console.log("Sending command: " + messageCommand + " to server.");
            socket.emit("messageCommand", { command: messageCommand, args: arrayMessage });
        }

        lastChatBoxCommand = chatBox;
        return true;
    }
    else {
        return false;
    }
}


function updateDarkTheme(checked) {
    if (checked === true) {
        $("body")[0].classList.add("dark");
        $(".well").addClass("dark");
        $("input").addClass("dark");
        $("textarea").addClass("dark");
        $(".btn-default").addClass("btn-inverse");
        $(".navbar").addClass("navbar-inverse");
        $("#playerHighlightColourButton").addClass("buttonDark");
        $("#playerHighlightColourButton2").addClass("buttonDark");
    }
    else {
        $("body")[0].classList.remove("dark");
        $(".well").removeClass("dark");
        $("input").removeClass("dark");
        $("textarea").removeClass("dark");
        $(".btn-default").removeClass("btn-inverse");
        $(".navbar").removeClass("navbar-inverse");
        $("#playerHighlightColourButton").removeClass("buttonDark");
        $("#playerHighlightColourButton2").removeClass("buttonDark");
    }
}

function updateTwoTabs(checked){
    if(checked === true){
        $("#tabs1").addClass("col-xs-6");
        $("#tabs2").removeClass("displayNoneClass");

    }
    else{
        $("#tabs1").removeClass("col-xs-6");
        $("#tabs2").addClass("displayNoneClass");
    }
}


function unescapeHtml(unsafe) {
    return unsafe
         .replace(/&amp;/g, "&")
         .replace(/&lt;/g, "<")
         .replace(/&gt;/g, ">")
         .replace(/&quot;/g, '"')
         .replace(/&#039;/g, "'")
      
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function scaleMiddleBoxes(){
    gameTableHeight = $("#mainRoomBox").height();

    const startScalingHeight = 300;
    const maxHeightOfBoxes = 60; //in px
    const scaleFactor = maxHeightOfBoxes/startScalingHeight;

    var setHeightOfMissionBox = gameTableHeight*scaleFactor;

    var ratioToReduce = (setHeightOfMissionBox / maxHeightOfBoxes);

  // console.log("Reduce by: " + ratioToReduce);
    if(ratioToReduce > 1){
        ratioToReduce = 1;
    }

    // $("#missionsBox").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")")
    $("#missionsBox").css("transform", "translateX(-47%) scale(" + ratioToReduce + ")")


    //also scale the approve reject buttons
    $(".approveLabel").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")");
    $(".rejectLabel").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")");

}

function updateSpectatorsList(){
    $("#spectators-table tbody tr td").remove();
    $("#spectators-table tbody tr").remove();

    //append each player into the list
    roomSpectatorsData.forEach(function (spectator) {

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

}



var sounds = {
    "slap": "slap.mp3",
    "buzz": "ding.mp3",
    "ding": "ding.mp3",
    "game-start": "game-start.mp3",
    "game-end": "game-end.mp3",
    "highDing": "highDing.mp3",
    "dingDingDing": "dingDingDing.mp3"
}

//get all the sound files and prepare them.
var soundFiles = {};
for(var key in sounds){
    if(sounds.hasOwnProperty(key)){
        soundFiles[key] = new Audio('sounds/' + sounds[key])
    }
}

function playSound(soundToPlay){
    if($("#option_notifications_sound_enable")[0].checked === false){
        return false;
    }
    else if(gameStarted && $("#option_notifications_sound_enable_in_game")[0].checked === false){
        return false;
    }
    else{
        soundFiles[soundToPlay].volume = $("#option_notifications_sound_volume")[0].value / 100;
        soundFiles[soundToPlay].play();
    }
}


function displayNotification(title, body, icon, tag){

    if(Notification.permission === "granted" && $("#option_notifications_desktop_enable")[0].checked === true){
        var options = {
            body: body,
            icon: icon,
            tag: tag
        }
    
        var notif = new Notification(title, options);
    }
}
