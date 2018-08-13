
var socket = io();

// socket.on('reconnect_attempt', () => {
//     socket.io.opts.transports = [, 'websocket'];
//   });

// console.log("started");

//grab our username from the username assigned by server in EJS file.
var ownUsername = $("#originalUsername")[0].innerText;

setInterval(function(){
    extendTabContentToBottomInRoom();

}, 1000);



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


//when the navbar is closed, re-exted the tab content to bottom.
$('.navbar-collapse').on('hidden.bs.collapse', function () {
    extendTabContentToBottomInRoom();
});




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
//FUNCTIONS
//======================================


var highlightedAvatars;
function draw() {
    // console.log("draw called");
    if (roomPlayersData) {


    highlightedAvatars = getHighlightedAvatars();
    
        drawAndPositionAvatars();

        drawTeamLeaderStar();

        drawMiddleBoxes();
        scaleMiddleBoxes();

        drawClaimingPlayers(roomPlayersData.claimingPlayers);

        drawGuns();

        console.log(highlightedAvatars);
        restoreHighlightedAvatars(highlightedAvatars);

        
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

                var str = "";
                //show the remaining players who haven't voted if we have voted
                if (gameData.playersYetToVote.indexOf(ownUsername) === -1) {
                    str += "Waiting for mission votes: ";

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


                //show the remaining players who haven't voted
                // var str = "Waiting for mission votes: ";

                // for (var i = 0; i < gameData.playersYetToVote.length; i++) {
                //     str = str + gameData.playersYetToVote[i] + ", ";
                // }

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
                    document.querySelector("#status").innerText = "Shoot merlin.";
                    // console.log
                    assassinationSetup(gameData.phase);
                }
                else {
                    if(gameData.assassin){
                        document.querySelector("#status").innerText = "Waiting for " + gameData.assassin + " to assassinate Merlin...";
                    }
                    else{
                        document.querySelector("#status").innerText = "Waiting for assassin to assassinate.";
                    }
                }
            //   enableDisableButtons();
            }
            else if (gameData.phase === "lady") {
                document.querySelector("#status").innerText = gameData.statusMessage;
                if (ownUsername === getUsernameFromIndex(gameData.lady)) {
                    ladySetup(gameData.phase, gameData.ladyablePeople);
                }
            //   enableDisableButtons();
            }

            else if (gameData.phase === "finished") {
                document.querySelector("#status").innerText = gameData.statusMessage;
            //   enableDisableButtons();
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
        }

        activateAvatarButtons();
        enableDisableButtons();
        //do this
        //if we are the team leader---------------------------------------------
        if (gameData && gameData.teamLeader && getIndexFromUsername(ownUsername) === gameData.teamLeader && gameData.phase === "picking") {
            enableDisableButtonsLeader(gameData.numPlayersOnMission[gameData.missionNum - 1]);  
        }
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

      var darkModeEnabled = $("#option_display_dark_theme")[0].checked;
      if(darkModeEnabled === true){
        str = str + "<span><img src='pictures/bullet-dark.png' class='bullet'></span>";
      }
      else{
        str = str + "<span><img src='pictures/bullet.png' class='bullet'></span>";
      }

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

        var spies;
        if(gameData && gameData.see){
        spies = gameData.see.spies;
        }

        for (var i = 0; i < divs.length; i++) {

            //if the player is not a "seeable" spy, then make them selectable
            console.log("spies: ");
            console.log(spies);
            console.log("Username of player: " + divs[i].getAttribute("usernameofplayer"));
            if(spies.indexOf(divs[i].getAttribute("usernameofplayer")) === -1){

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

      widthOfRoom = $("#mainRoomBox").width();
      $("#missionsBox").css("left", (widthOfRoom/2) + "px");
}

//set up the hover over missions box and highlight participating members







var playerDivHeightPercent = 30;
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

    var scaleWidthDown;
    if(numPlayers === 6){
    scaleWidthDown = 0.8;
    }
    else{
    scaleWidthDown = 0.8;  
    }
    const scaleHeightDown = 1;

    var a = (w / 2)*scaleWidthDown;
    var b = (h / 2)*scaleHeightDown;


    var playerLocations = generatePlayerLocations(numPlayers, a, b);

    for (var i = 0; i < numPlayers; i++) {
        // console.log("player position: asdflaksdjf;lksjdf");
        var offsetX = w / 2;
        var offsetY = h / 2;
        
        //reduce the height so that the bottom of avatars dont crash into the bottom.
        offsetY = offsetY * 1;

    // console.log("offsetY: " + offsetY);


        var strX = playerLocations.x[i] + offsetX + "px";
        var strY = playerLocations.y[i] + offsetY + "px";

        divs[i].style.left = strX;
        divs[i].style.bottom = strY;

        var ratioXtoY = 1;

        divs[i].style.height = playerDivHeightPercent + "%";

        var maxAvatarHeight = $("#option_display_max_avatar_height")[0].value;
        console.log($(divs[i]).height());
        if($(divs[i]).height() > maxAvatarHeight){
        divs[i].style.height = maxAvatarHeight + "px";
        }


        //was trying to set width of div to be same as length of text but that doesnt work
        //cos guns also expand.

    //   if($($(divs[i])[0]).find(".role-p")[0] ){
    //     var canvas = document.createElement("canvas");
    //     var ctx=canvas.getContext("2d");
        
    //     ctx.font = $("#option_display_font_size_text").val(); + "px";
    //     var roleHere = $($(divs[i])[0]).find(".role-p")[0].innerHTML;
    //     console.log($($(divs[i])[0]).find(".role-p")[0].innerHTML);
        
    //     var widthOfRole = ctx.measureText(roleHere).width;

    //     console.log("width: " + widthOfRole);

    //     if(divs[i].offsetHeight < widthOfRole){
    //         divs[i].style.width =  widthOfRole + "px";

    //         if($($(divs[i])[0]).find(".gun")[0] ){
    //             $($(divs[i])[0]).find(".gun")[0].height(divs[i].offsetHeight + "px");
    //         }

    //       }
    //   }




    //   var canvas = document.createElement("canvas");
    //   var ctx=canvas.getContext("2d");
    //   var roleHere = $($(divs[i]).find(".role-p")).innerHTML;
    //   var widthOfRole = Math.floor(ctx.measureText(roleHere).width);




        
    divs[i].style.width = divs[i].offsetHeight * ratioXtoY + "px";


    var divHeightPos = $(divs[i]).position().top * 1.4;
    var translateValue = (-100/(2*b))*(divHeightPos-2*b);

    $(divs[i]).css("transform", "translate(-50%, " + translateValue + "%)");








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



  


  var whenToShowGuns = [
    "voting",
    "missionVoting",
    "assassination",
    "finished"
];

  var lastPickNum = 0;
  var lastMissionNum = 0;
  function drawGuns() {
    $(".gun img").css("width", $("#mainRoomBox div").width() + "px"); 
    $(".gun").css("width", $("#mainRoomBox div").width() + "px"); 

    

    if(gameData && gameData.phase){
        if(whenToShowGuns.indexOf(gameData.phase) === -1){
            $(".gun").css("left", "50%"); 
            $(".gun").css("top", "50%"); 
            $(".gun").css("transform", "translate(-50%,-50%)"); 
            $(".gun").removeClass("gunAfter"); 
            $(".gun").addClass("gunBefore"); 
        }
    }
    else{
        $(".gun").css("left", "50%"); 
            $(".gun").css("top", "50%"); 
            $(".gun").css("transform", "translate(-50%,-50%)"); 
            $(".gun").removeClass("gunAfter"); 
            $(".gun").addClass("gunBefore"); 
    }
    
        if(gameData && (lastPickNum !== gameData.pickNum || lastMissionNum !== gameData.missionNum)){
            // $(".gun").css("width", $("#mainRoomBox div").width() + "px"); 
            $(".gun").css("left", "50%"); 
            $(".gun").css("top", "50%"); 
            $(".gun").css("transform", "translate(-50%,-50%)"); 
            $(".gun").removeClass("gunAfter"); 
            $(".gun").addClass("gunBefore"); 

            if(gameData && gameData.proposedTeam){
                // gameData.propsedTeam
                for (var i = 0; i < gameData.proposedTeam.length; i++) {
                    console.log("not hidden stuff");
                    //set the div string and add the gun
                    //   var str = $(".room-container")[0].innerHTML;
                    //   str = str + "<span><img src='pictures/gun.png' class='gun'></span>";
                    //update the str in the div
                    //   $(".room-container")[0].innerHTML = str;
                    //   $("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])].innerHTML = str;
                    //   console.log($($(".room-container")[0]).position());




                    // $($(".gun")[i]).css("left", $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().left + "px"); 
                    // $($(".gun")[i]).css("top", $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().top + "px"); 
                    

                    var widOfGun = $(".gun").width();
                    var heightOfGun = $(".gun").height();

                    $($(".gun")[i]).animate({
                        top: $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().top + (heightOfGun*1.5) + "px" ,
                        left: $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().left + (widOfGun/2) + "px",
                    }, 500);
                    $($(".gun")[i]).removeClass("gunBefore"); 
                    $($(".gun")[i]).addClass("gunAfter"); 

                lastPickNum = gameData.pickNum;
                lastMissionNum = gameData.missionNum;
            }   
        

            
            // $($(".gun")[i]).css("transform", "translateY(150%)"); 

            // divs[i].style.width = divs[i].offsetHeight * ratioXtoY + "px";
        }
    }
    else{
        adjustGunPositions();
    }
}

  function adjustGunPositions(){
    if(gameData && gameData.proposedTeam){     
        for (var i = 0; i < gameData.proposedTeam.length; i++) {

            var widOfGun = $(".gun").width();
            var heightOfGun = $(".gun").height();


            $($(".gun")[i]).css("top", $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().top + (heightOfGun*1.5) + "px"); 
            $($(".gun")[i]).css("left", $($("#mainRoomBox div")[getIndexFromUsername(gameData.proposedTeam[i])]).position().left + (widOfGun/2) + "px"); 
            
        }
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

    $("#claimButton")[0].innerText = "Claim";

    
    for(var i = 0; i < roomPlayersData.length; i++){
        if(roomPlayersData[i].claim && roomPlayersData[i].claim === true){
            if ($("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)]) {
                var str = $("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)].innerHTML;
                str = str + "<span><img src='pictures/claim.png' class='claimIcon'></span>";
                //update the str in the div
                $("#mainRoomBox div")[getIndexFromUsername(roomPlayersData[i].username)].innerHTML = str;
        
                // $(".claimIcon")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
            }

            if(roomPlayersData[i].username === ownUsername){
                $("#claimButton")[0].innerText = "Unclaim";
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
    showYourTurnNotification(false);

    //are we a player sitting down?
    var isPlayer = false;
    for(var i = 0; i < roomPlayersData.length; i++){
        if(roomPlayersData[i].username === ownUsername){
            //if we are a player sitting down, then yes, we are a player
            isPlayer = true;
        }
    }
    isSpectator = !isPlayer;


    //reset the faded class for the buttons
    document.querySelector("#green-button").classList.remove("faded");
    //determine if we are spectator or not
    for(var i = 0; i < roomPlayersData.length; i++){
        if(roomPlayersData[i].username === ownUsername){
            isSpectator = false;
            break;
        }
    }

      
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
            document.querySelector("#red-button").classList.remove("disabled");
            document.querySelector("#red-button").innerText = "Stand up";
            
        }
    }
    else if (gameStarted === true && isSpectator === false) {
        //if we are in picking phase
        if (gameData.phase === "picking") {
            document.querySelector("#green-button").classList.add("disabled");
            document.querySelector("#green-button").innerText = "Pick";

            document.querySelector("#red-button").classList.add("disabled");
            // document.querySelector("#red-button").innerText = "Disabled";

            if(getUsernameFromIndex(gameData.teamLeader) === ownUsername){
                showYourTurnNotification(true);
            }
        }

        //if we are in voting phase
        else if (gameData.phase === "voting") {
            if (checkEntryExistsInArray(gameData.playersYetToVote, ownUsername)) {
                // showYourTurnNotification(true);

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
                // showYourTurnNotification(true);

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

            if ("Assassin" === gameData.role) {
                showYourTurnNotification(true);
            }

            //if there is only one person highlighted
            if (countHighlightedAvatars() == 1) {
                document.querySelector("#green-button").classList.remove("disabled");
            }
            else {
                document.querySelector("#green-button").classList.add("disabled");
            }
        }
        else if (gameData.phase === "lady") {
            if (ownUsername === getUsernameFromIndex(gameData.lady)) {
                showYourTurnNotification(true);
            }
            
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
            drawGuns();
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

function restoreHighlightedAvatars(usernames){
    usernames.forEach(function(username){
        $($("#mainRoomBox div")[getIndexFromUsername(username)]).addClass("highlight-avatar");
    });
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

    //to get the lengths of the words or usernames
    var canvas = document.createElement("canvas");
    var ctx=canvas.getContext("2d");
    ctx.font = $("#option_display_font_size_text").val() + "px sans-serif";


    //can improve this code here
    if (gameStarted === true && gameData.phase === "finished") {
        var roleWid = ctx.measureText(gameData.see.roles[getIndexFromUsername(playerData.username)]).width + 20;
        
        role = "<p class='role-p' style='width: " + roleWid + "px; margin: auto;'>" + gameData.see.roles[getIndexFromUsername(playerData.username)] + "</p>";
    }

    else if (gameStarted === true) {
        
        
        //if rendering our own player, give it the role tag
        if (playerData.username === ownUsername) {
            var roleWid = ctx.measureText(gameData.role).width + 20;
            role = "<p class='role-p' style='width: " + roleWid + "px; margin: auto;'>" + gameData.role + "</p>";
        }
        else if (gameData.see.merlins.indexOf(playerData.username) !== -1) {
            var roleWid = ctx.measureText("Merlin?").width + 20;

            role = "<p class='role-p' style='width: " + roleWid + "px; margin: auto;'>" + "Merlin?" + "</p>";
        }
    }

    if (playerData.username === getUsernameFromIndex(gameData.lady)) {

        var nameWid = ctx.measureText(playerData.username).width;
        var widOfBox = $("#mainRoomBox div").width();

        var littleProtrudingEdgeWid = (nameWid - widOfBox) / 2;
        var offsetDist = (nameWid - littleProtrudingEdgeWid) + 5;

    
        lady = "<span class='glyphicon glyphicon-book' style='top: 50%; transform: translateY(-50%); position: absolute; right: " + offsetDist + "px'></span> ";
    }


    //add in the hammer star
    var hammerStar = "";
    // console.log(playerData.username);
    // console.log(ctx.font);
    var nameWid = ctx.measureText(playerData.username).width;
    // console.log(nameWid);

    

    var widOfBox = $("#mainRoomBox div").width();
    // console.log(widOfBox);

    var littleProtrudingEdgeWid = (nameWid - widOfBox) / 2;
    var offsetDist = (nameWid - littleProtrudingEdgeWid) + 5;

    

    // console.log(offsetDist);

    if (gameStarted === false) {
        //give hammer star to the host
        if (playerData.username === getUsernameFromIndex(0)) {
            hammerStar = "<span style='top: 50%; transform: translateY(-50%); position: absolute; left: " + offsetDist + "px;' class='glyphicon glyphicon-star'></span>";
        }
    }
    else {
        if (playerData.username === getUsernameFromIndex(gameData.hammer)) {
            hammerStar = "<span style='top: 50%; transform: translateY(-50%); position: absolute; left: " + offsetDist + "px;' class='glyphicon glyphicon-star'></span>";
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
    str += "<p class='username-p' style='white-space:nowrap; position:relative;'>" + lady + " " + playerData.username + " " + hammerStar + " </p>" + role + "</div>";


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

function scrollDown(chatBox, hardScroll) {
    //example input of chatBox: all-chat-room

    if(chatBox[0] === "#"){
        chatBox = chatBox.slice(1, chatBox.length);
    }

    
    
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

    if(lastMessages.length !== 0){
        var lastMessage = lastMessages[lastMessages.length-1];
        var extraHeight = $(lastMessage).height() - 20;
    
        var i = lastMessages.length-1 - 1;
        while(lastMessage.classList.contains("myQuote")){
            lastMessage = lastMessages[i];
            extraHeight += $(lastMessage).height() - 20;
            i--;
        }
    
        
    
        heightOfLastMessage = ((lastMessages.length-1) - i)*20;
    
      // console.log("Height: " + heightOfLastMessage);
    
    
        if((listBox.height() - scrollBox.scrollTop() - scrollBox.height()) > 5 + heightOfLastMessage + extraHeight){
            //Show user that there is a new message with the red bar.
            //Show because the only time this will trigger is when a new message comes in anyway
            $(searchStrBar).removeClass("hidden");
        }
        else {
            scrollBox.scrollTop(listBox.height());
            $(searchStrBar).addClass("hidden");
        }
    }

    if(hardScroll === true){
        // $("#mydiv").scrollTop($("#mydiv")[0].scrollHeight);

        scrollBox.scrollTop(scrollBox[0].scrollHeight);
    }

    
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
    6: {
        0: 26,
        1: 90,
        2: 154,
        3: 206,
        4: 270,
        5: 334,
    },

    7: {
        1: 35,
        3: 157,
        4: 203,
        6: 325
    },
    8: {
        1: 35,

        3: 145,
        5: 215,

        7: 325
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
        // var tiltOffset = step / 2;
    }

    for (var i = 0; i < numOfPlayers; i++) {
        if(customSteps[numOfPlayers] && customSteps[numOfPlayers][i]){
            x_[i] = a * (Math.cos(toRadians((customSteps[numOfPlayers][i]) + 90 + tiltOffset))) * 1;
            y_[i] = b * (Math.sin(toRadians((customSteps[numOfPlayers][i]) + 90 + tiltOffset))) * 1;
        }
        else{
            //get the coordinates. Note the +90 is to rotate so that
            //the first person is at the top of the screen
            x_[i] = a * (Math.cos(toRadians((step * i) + 90 + tiltOffset))) * 1;
            y_[i] = b * (Math.sin(toRadians((step * i) + 90 + tiltOffset))) * 1;
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

    oldProposedTeam = false;

    //hide the options cog
    document.querySelector("#options-button").classList.add("hidden");

    //reset room-chat 
    // console.log("RESET ROOM CHAT");
    $(".room-chat-list").html("");

    //reset the vh table
    // $("#voteHistoryTable")[0].innerHTML = "";
    $(".voteHistoryTableClass")[0].innerHTML = "";
    $(".voteHistoryTableClass")[1].innerHTML = "";

    $("#missionsBox").addClass("invisible");
    
    lastPickNum = 0;
    lastMissionNum = 0;

}

var tempVar = 0;

var gameContainer = $(".game-container")[0];
var tabNumber = $("#tabs1");
var tabContainer = $(".tab-content");
var navTabs = $(".nav-tabs");

function extendTabContentToBottomInRoom() {
    //extending the tab content to the bottom of the page:

    //20 pixel diff for navbar
    



    if($("#tabs1 .nav").height() > 40){
        // console.log("ASDF");
        tempVar = 37;
    }
    else{
        tempVar = 0;
    }


    var newHeight2 = Math.floor(gameContainer.offsetHeight - tabNumber.position().top) - 20 - tempVar;
    // console.log("h: " + newHeight2);
  // console.log("new height 2: " + newHeight2);

    tabNumber[0].style.height = Math.floor((newHeight2 * 1) ) + "px";

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
                classStr: "server-text",
                dateCreated: new Date()
            }
            if (chatBox === "allChat") {
                addToAllChat(data);
            }
            else if (chatBox === "roomChat") {
                addToRoomChat(data);
            }
        }
        else {
            // sending command to server
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
        $("#tabs1").addClass("tabs1TwoTabs");
        $("#tabs2").addClass("tabs2TwoTabs");
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

    var startScalingHeight = 400;
    var maxHeightOfBoxes = 60; //in px
    var scaleFactor = maxHeightOfBoxes/startScalingHeight;

    var setHeightOfMissionBox = gameTableHeight*scaleFactor;

    var ratioToReduce = (setHeightOfMissionBox / maxHeightOfBoxes);

  // console.log("Reduce by: " + ratioToReduce);
    if(ratioToReduce > 1){
        ratioToReduce = 1;
    }

    // $("#missionsBox").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")")
    // $("#missionsBox").css("transform-origin", "bottom");
    $("#missionsBox").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")");


    var startScalingHeight = 200;
    var maxHeightOfBoxes = 60; //in px
    var scaleFactor = maxHeightOfBoxes/startScalingHeight;

    var setHeightOfMissionBox = gameTableHeight*scaleFactor;

    var ratioToReduce = (setHeightOfMissionBox / maxHeightOfBoxes);
    if(ratioToReduce > 1){
        ratioToReduce = 1;
    }
    //also scale the approve reject buttons
    $(".approveLabel").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")");
    $(".rejectLabel").css("transform", "translateX(-50%) scale(" + ratioToReduce + ")");

}





var sounds = {
    "slap": "slap.mp3",
    "buzz": "ding.mp3",
    "ding": "ding.mp3",
    "game-start": "game-start.mp3",
    "game-end": "game-end.mp3",
    "highDing": "highDing.mp3",
    "game-start-ready": "game-start-ready.mp3",
    "lick": "lick.mp3"
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


function showYourTurnNotification(ToF){
    if(ToF === true){
        // $("#statusBarWell").addClass("showYourTurnNotification");
        $("#green-button").addClass("unhide");
        // $("#statusBarWell").addClass("showFaded");
    }
    else if(ToF === false){
        // $("#statusBarWell").removeClass("showYourTurnNotification");
        $("#green-button").removeClass("unhide");
        // $("#statusBarWell").removeClass("showFaded");
    }
    else{
        console.log("error in show your turn notifications");
    }
}

function hi(){
    console.log("hi");
}