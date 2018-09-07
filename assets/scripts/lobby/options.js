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
            $("#div1Resize").resizable({ 
                handles: 's'
            });
            //on resize of div 1, resize div 2.
            $('#div1Resize').resize(function () {
                //Make the height adjustments
                userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();
                //save the new heights
                docCookies.setItem("optionDisplayHeightOfAvatarContainer", $("#div1Resize").height(), Infinity);

                //update the new resizeable heights
                $("#div1Resize").resizable("option","minHeight",parseInt($(window).height()*0.25,10));
                $("#div1Resize").resizable("option","maxHeight",parseInt($(window).height()*0.66,10));
            });
            //on whole window resize, resize both divs.
            $(window).resize(function () {
                $('#div1Resize').width($("#div2Resize").parent().width());

                //save the new heights
                docCookies.setItem("optionDisplayHeightOfAvatarContainer", $("#div1Resize").height(), Infinity);
                //Make the height adjustments
                userOptions["optionDisplayHeightOfAvatarContainer"].avatarContainerHeightAdjust();

                //update the new resizeable heights
                $("#div1Resize").resizable("option","minHeight",parseInt($(window).height()*0.25,10));
                $("#div1Resize").resizable("option","maxHeight",parseInt($(window).height()*0.66,10));
                
            });


            $("#option_display_avatar_container_height_text").on("change", function () {
                var containerHeight = $("#option_display_avatar_container_height_text")[0].value;
              // console.log(containerHeight);

                //assign bounds
                var lowerBound = parseInt($(window).height()*0.25,10);
                var upperBound = parseInt($(window).height()*0.66,10);

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

    optionDisplayMaxAvatarHeight: {
        defaultValue: "128",
        onLoad: function () {
            //get cookie data
            var maxAvatarHeight = docCookies.getItem("optionDisplayMaxAvatarHeight");

            //set the value in the users display
            $("#option_display_max_avatar_height")[0].value = maxAvatarHeight;

            draw();
        },
        initialiseEventListener: function () {
            $("#option_display_max_avatar_height").on("change", function () {
                var maxAvatarHeight = $("#option_display_max_avatar_height")[0].value;
              // console.log(fontSize);

                //assign bounds
                var lowerBound = 30;
                var upperBound = 128;

                //bound the font size
                if (maxAvatarHeight < lowerBound) {
                    maxAvatarHeight = lowerBound;
                }
                else if (maxAvatarHeight > upperBound) {
                    maxAvatarHeight = upperBound;
                }

                //display the new value in case it was changed by bounds
                $("#option_display_max_avatar_height")[0].value = maxAvatarHeight;

                draw();

                //save the data in cookie
                docCookies.setItem("optionDisplayMaxAvatarHeight", maxAvatarHeight, Infinity);
            });
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

    optionDisplayOriginalAvatars: {
        defaultValue: "false",
        onLoad: function(){
            if (docCookies.getItem("optionDisplayOriginalAvatars") === "true") {
                $("#option_display_original_avatars")[0].checked = true;
            }
        },
        initialiseEventListener: function(){
            $("#option_display_original_avatars")[0].addEventListener("click", function () {
                var checked = $("#option_display_original_avatars")[0].checked;
                draw();

                //save their option in cookie
                docCookies.setItem("optionDisplayOriginalAvatars", checked.toString(), Infinity);
            });
        }
    },

    optionDisplayCompactView: {
        defaultValue: "true",
        onLoad: function(){
            if (docCookies.getItem("optionDisplayCompactView") === "true") {
                $("#option_display_compact_view")[0].checked = true;

                updateCompactView(true);
            }
            else{
                updateCompactView(false);
            }
        },
        initialiseEventListener: function(){
            $("#option_display_compact_view")[0].addEventListener("click", function () {
                //when they press it...
                var checked = $("#option_display_compact_view")[0].checked;

                updateCompactView(checked);
                

                //save their option in cookie
                docCookies.setItem("optionDisplayCompactView", checked.toString(), Infinity);
            });
        }
    },

    optionDisplayProposedTeamIcon: {
        defaultValue: "false",
        onLoad: function(){
            //check if optionDisplayProposedTeamIcon exists in cookies
            var isOptionExists = docCookies.hasItem("optionDisplayProposedTeamIcon");
            var icon = "";
            //if not, set it
            if (isOptionExists === false) {
                icon = "gun";
                //save it in cookie
                docCookies.setItem("optionDisplayProposedTeamIcon", icon, Infinity);
            } else {
                //else load it
                icon = docCookies.getItem("optionDisplayProposedTeamIcon");
            }
            //set check marks
            if (icon === "shield") {
                $("#option_display_proposed_team_icon")[0].checked = true;
            }
            else{
                $("#option_display_proposed_team_icon")[0].checked = false;
            }
            //update image on load
            updateGunImage(icon);
        },
        initialiseEventListener: function(){
            $("#option_display_proposed_team_icon")[0].addEventListener("click", function () {
                //when they press it...
                var isChecked = $("#option_display_proposed_team_icon")[0].checked;
                var icon = "";
                if(isChecked === true){
                    icon = "shield";
                } else {
                    icon = "gun";
                }
                //save their option in cookie
                docCookies.setItem("optionDisplayProposedTeamIcon", icon, Infinity);
                //update image on click
                updateGunImage(icon);
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





//HIGHLIGHT COLOURS


var defaultColours = [
    '#ff6d6d', 
    '#ffff9e',
    "#c5b5ff",
    "#ff9b9b",
    '#9aa888', 
    '#96ff96',
    '#72afac',
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


function updateCompactView(input){
    if(input === true){
        $("#tabs1").css("padding-right", "0px");
        $("#tabs2").css("padding-left", "0px");

        $(".well").css("margin-bottom", "0px");
        $(".well").css("margin-top", "0px");
        
    }
    else{
        $("#tabs1").css("padding-right", "15px");
        $("#tabs2").css("padding-left", "15px");

        $(".well").css("margin-bottom", "20px");
        $(".well").css("margin-top", "20px");
        

    }
}

function updateGunImage(input) {
    if (input === "shield") {
            //when shields are used
            $(".gunImg").attr("src","pictures/shield.png");
    } else {
        //when guns are used
        $(".gunImg").attr("src","pictures/gun.png");
    }
    adjustGunPositions();
    draw();
}