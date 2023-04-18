const socket = io();

// socket.on('reconnect_attempt', () => {
//     socket.io.opts.transports = [, 'websocket'];
//   });

// console.log("started");

// grab our username from the username assigned by server in EJS file.
const ownUsername = $('#originalUsername')[0].innerText;

// register all buttons here for easier access
// less problems on debugging
const buttons = {
  red: '#red-button',
  green: '#green-button',
  claim: '#claimButton',
};

setInterval(() => {
  extendTabContentToBottomInRoom();

  // Extend the div1resize box to be full width
  // if the difference between the widths is close enough to 0, then change width
  if (
    Math.abs(
      $('#div1Resize').width() - $('#div1Resize').parent().width() * 0.95
    ) > 1
  ) {
    // console.log('Changed width:');
    $('#div1Resize').width($('#div1Resize').parent().width());
    draw();
    draw();
  }
}, 1000);

// Prevents the window height from changing when android keyboard is pulled up.
setTimeout(() => {
  const viewheight = $(window).height();
  const viewwidth = $(window).width();
  const viewport = document.querySelector('meta[name=viewport]');
  viewport.setAttribute(
    'content',
    `height=${viewheight}, width=${viewwidth}, initial-scale=1.0`
  );

  // Extend divs to bottom of page:
  // All chat in lobby
  const parentH = $('#col1')[0].offsetHeight;
  const textH = $('#all-chat-lobby-text')[0].offsetHeight;
  const inputH = $('.all-chat-message-input')[0].offsetHeight;
  const newHeight = parentH - textH - inputH;
  // $("#all-chat-lobby")[0].style.height = (newHeight - 10) + "px";
}, 300);

// when the navbar is closed, re-exted the tab content to bottom.
$('.navbar-collapse').on('hidden.bs.collapse', () => {
  extendTabContentToBottomInRoom();
});

// for the game
let roomPlayersData;
let roomSpectatorsData;
let seeData;
let gameData;
let roomId;
let gameStarted = false;

let inRoom = false;

let isSpectator = false;

// window resize, repaint the users
window.addEventListener('resize', () => {
  // console.log("Resized");

  checkStatusBarWithHeight();
  draw();
});

//= =====================================
// FUNCTIONS
//= =====================================

let highlightedAvatars;
function draw() {
  // console.log("draw called");
  if (roomPlayersData) {
    highlightedAvatars = getHighlightedAvatars();

    drawAndPositionAvatars();
    drawClaimingPlayers(roomPlayersData.claimingPlayers);

    setTimeout(() => {
      // Enable the tooltip for hammer after 2 seconds for the screen to load and reposition
      $('.hammerSpan').tooltip();
    }, 2000);

    drawTeamLeader();
    drawMiddleBoxes();
    drawGuns();
    runPublicDataAvalon(gameData);

    scaleGameComponents();

    // default greyed out rn
    // enableDisableButtons();

    // console.log(highlightedAvatars);
    restoreHighlightedAvatars(highlightedAvatars);

    if (gameStarted === true) {
      drawExitedPlayers(gameData.gamePlayersInRoom);

      if (gameData.finished !== true) {
        $('#missionsBox').removeClass('invisible');

        // give it the default status message
        setStatusBarText(gameData.statusMessage);

        // draw the votes if there are any to show
        drawVotes(gameData.votes);

        if (typeof gameData.numSelectTargets === 'number') {
          if (
            gameData.numSelectTargets !== 0 &&
            gameData.numSelectTargets !== null
          ) {
            if (gameData.prohibitedIndexesToPicks) {
              enableSelectAvatars(gameData.prohibitedIndexesToPicks);
            } else {
              enableSelectAvatars();
            }
          }
        } else if (
          typeof gameData.numSelectTargets === 'object' &&
          gameData.numSelectTargets !== undefined &&
          gameData.numSelectTargets !== null
        ) {
          if (
            gameData.numSelectTargets[0] !== 0 &&
            gameData.numSelectTargets !== null
          ) {
            if (gameData.prohibitedIndexesToPicks) {
              enableSelectAvatars(gameData.prohibitedIndexesToPicks);
            } else {
              enableSelectAvatars();
            }
          }
        }
      }
    } else {
      // TODO REMOVE THIS LATER
      // if we are the host
      if (ownUsername === getUsernameFromIndex(0)) {
        currentOptions = getOptions();
        let str = '';

        currentOptions.forEach((element) => {
          str += `${element}, `;
        });

        // remove the last , and replace with .
        str = str.slice(0, str.length - 2);
        str += '.';

        setStatusBarText(`Current roles: ${str}`);
      } else {
        setStatusBarText('Waiting for game to start... ');
      }
    }

    activateAvatarButtons();
    enableDisableButtons();
    if (gameData) {
      checkSelectAvatarButtons(gameData.numSelectTargets);
    }
  } else {
    $('#mainRoomBox')[0].innerHTML = '';
  }
}

let selectedAvatars = {};
const numOfStatesOfHighlight = 3;
const selectedChat = {};
function activateAvatarButtons() {
  // console.log("activate avatar buttons");
  // console.log("LOL");
  // if(OPTION THING ADD HERE){
  const highlightButtons = document.querySelectorAll(
    '#mainRoomBox div #highlightAvatarButton'
  );
  // add the event listeners for button press

  // console.log("added " + highlightButtons.length + " many listeners for highlightbuttons");

  for (var i = 0; i < highlightButtons.length; i++) {
    // console.log(i);

    highlightButtons[i].addEventListener('click', function () {
      // //toggle the highlight class
      // var divs = document.querySelectorAll("#mainRoomBox div");
      // var uniqueNum = i;
      // console.log("click for highlight avatar");

      // this.parentElement.classList.toggle("selected-avatar");
      const username =
        this.parentElement.parentElement.getAttribute('usernameofplayer');
      // console.log("username: " + username);

      if (selectedAvatars[username] !== undefined) {
        selectedAvatars[username] += 1;
      } else {
        selectedAvatars[username] = 1;
      }

      selectedAvatars[username] =
        selectedAvatars[username] % (numOfStatesOfHighlight + 1);
      // console.log("Selected avatars num: " + selectedAvatars[username])
      draw();
    });
  }

  const highlightChatButtons = document.querySelectorAll(
    '#mainRoomBox div #highlightChatButton'
  );
  // add the event listeners for button press
  for (var i = 0; i < highlightChatButtons.length; i++) {
    highlightChatButtons[i].addEventListener('click', function () {
      // //toggle the highlight class
      // console.log("click for highlight chat");

      const username =
        this.parentElement.parentElement.getAttribute('usernameofplayer');
      const chatItems = $(`.room-chat-list li span[username='${username}']`);

      let playerHighlightColour = docCookies.getItem(
        `player${getIndexFromUsername(username)}HighlightColour`
      );

      const setHighlightColorToYellow = $('.setHighlightColorsToYellow')[0]
        .checked;

      if (setHighlightColorToYellow === true) {
        playerHighlightColour = '#ffff9e';
      }

      // console.log("Player highlight colour: " + playerHighlightColour);

      if (selectedChat[username] === true) {
        selectedChat[username] = false;
        chatItems.css('background-color', 'transparent');
        chatItems.css('color', '');
      } else {
        // console.log("set true");
        selectedChat[username] = true;
        chatItems.css('background-color', `${playerHighlightColour}`);
        chatItems.css('color', '#333');
      }
      draw();
    });
  }
}

function drawVotes(votes) {
  const divs = document.querySelectorAll('#mainRoomBox div');

  if (votes) {
    for (var i = 0; i < divs.length; i++) {
      if (votes[i] === 'approve') {
        $($('#mainRoomBox div')[i])
          .find('.approveLabel')
          .removeClass('invisible');
      }
      if (votes[i] === 'reject') {
        $($('#mainRoomBox div')[i])
          .find('.rejectLabel')
          .removeClass('invisible');
      }
      // document.querySelectorAll("#mainRoomBox div")[i].classList.add(votes[i]);
    }
  } else {
    for (var i = 0; i < divs.length; i++) {
      // document.querySelectorAll("#mainRoomBox div")[i].classList.remove("approve");
      // document.querySelectorAll("#mainRoomBox div")[i].classList.remove("reject");

      $($('#mainRoomBox div')[i]).find('.approveLabel').addClass('invisible');
      $($('#mainRoomBox div')[i]).find('.rejectLabel').addClass('invisible');
    }
  }
}

function assassinationSetup(phase) {
  if (phase === 'assassination') {
    const divs = document.querySelectorAll('#mainRoomBox div');
    // add the event listeners for button press

    let spies;
    if (gameData && gameData.see) {
      spies = gameData.see.spies;
    }

    for (let i = 0; i < divs.length; i++) {
      // if the player is not a "seeable" spy, then make them selectable
      // console.log("spies: ");
      // console.log(spies);
      // console.log("Username of player: " + divs[i].getAttribute("usernameofplayer"));
      if (spies.indexOf(divs[i].getAttribute('usernameofplayer')) === -1) {
        divs[i].addEventListener('click', function () {
          // console.log("avatar pressed");
          // toggle the highlight class
          this.classList.toggle('highlight-avatar');
          // change the pick team button to enabled/disabled
          enableDisableButtons();
        });
      }
    }
  }
}

function enableSelectAvatars(prohibitedIndexesToPicks) {
  // var numPlayersOnMission = gameData.numPlayersOnMission[gameData.missionNum - 1];

  const divs = document.querySelectorAll('#mainRoomBox div');
  // add the event listeners for button press
  for (let i = 0; i < divs.length; i++) {
    if (
      prohibitedIndexesToPicks === undefined ||
      prohibitedIndexesToPicks.includes(i) === false
    ) {
      divs[i].addEventListener('click', function () {
        // console.log("avatar pressed");
        // toggle the highlight class
        this.classList.toggle('highlight-avatar');
        // change the pick team button to enabled/disabled
        checkSelectAvatarButtons(gameData.numSelectTargets);
      });
    }
  }
  // checkSelectAvatarButtons(gameData.numSelectTargets);
}

function drawMiddleBoxes() {
  // draw missions and numPick
  // j<5 because there are only 5 missions/picks each game
  if (gameData) {
    for (var j = 0; j < 5; j++) {
      // missions
      const missionStatus = gameData.missionHistory[j];
      if (missionStatus === 'succeeded') {
        document
          .querySelectorAll('.missionBox')
        [j].classList.add('missionBoxSucceed');
        document
          .querySelectorAll('.missionBox')
        [j].classList.remove('missionBoxFail');
      } else if (missionStatus === 'failed') {
        document
          .querySelectorAll('.missionBox')
        [j].classList.add('missionBoxFail');
        document
          .querySelectorAll('.missionBox')
        [j].classList.remove('missionBoxSucceed');
      }

      // draw in the number of players in each mission
      const numPlayersOnMission = gameData.numPlayersOnMission[j];
      if (numPlayersOnMission) {
        document.querySelectorAll('.missionBox')[
          j
        ].innerHTML = `<p>${numPlayersOnMission}</p>`;
      }

      // picks boxes
      const { pickNum } = gameData;
      if (j < pickNum) {
        document.querySelectorAll('.pickBox')[j].classList.add('pickBoxFill');
      } else {
        document
          .querySelectorAll('.pickBox')
        [j].classList.remove('pickBoxFill');
      }
    }
  } else {
    for (var j = 0; j < 5; j++) {
      document
        .querySelectorAll('.missionBox')
      [j].classList.remove('missionBoxFail');
      document
        .querySelectorAll('.missionBox')
      [j].classList.remove('missionBoxSucceed');
      document.querySelectorAll('.missionBox')[j].innerText = '';
      document.querySelectorAll('.pickBox')[j].classList.remove('pickBoxFill');
    }
  }

  widthOfRoom = $('#mainRoomBox').width();
  $('#missionsBox').css('left', `${widthOfRoom / 2}px`);
}

const playerDivHeightPercent = 30;
function drawAndPositionAvatars() {
  const w = $('#mainRoomBox').width();
  const h = $('#mainRoomBox').height();

  const numPlayers = roomPlayersData.length; // 3;

  // generate the divs in the html
  let str = '';
  // console.log("Game started: " + gameStarted);
  if (gameStarted === true) {
    // draw the players according to what the client sees (their role sees)
    for (var i = 0; i < numPlayers; i++) {
      // check if the user is on the spy list.
      // if they are, they are spy
      if (
        gameData.see &&
        gameData.see.spies &&
        gameData.see.spies.indexOf(roomPlayersData[i].username) !== -1
      ) {
        str += strOfAvatar(roomPlayersData[i], 'spy');
      }
      // else they are a res
      else {
        str += strOfAvatar(roomPlayersData[i], 'res');
      }
    }
  }
  // when game has not yet started, everyone is a res image
  else {
    for (var i = 0; i < numPlayers; i++) {
      str += strOfAvatar(roomPlayersData[i], 'res');
    }
  }

  // set the divs into the box
  $('#mainRoomBox').html(str);

  //= ==============================================
  // POSITIONING SECTION
  //= ==============================================

  // set the positions and sizes
  // console.log("numPlayers: " + numPlayers)
  const divs = document.querySelectorAll('#mainRoomBox div');

  let scaleWidthDown;
  if (numPlayers === 6) {
    scaleWidthDown = 0.8;
  } else {
    scaleWidthDown = 0.8;
  }
  const scaleHeightDown = 1;

  const a = (w / 2) * scaleWidthDown;
  const b = (h / 2) * scaleHeightDown;

  const playerLocations = generatePlayerLocations(numPlayers, a, b);

  for (var i = 0; i < numPlayers; i++) {
    // console.log("player position: asdflaksdjf;lksjdf");
    const offsetX = w / 2;
    let offsetY = h / 2;

    // reduce the height so that the bottom of avatars dont crash into the bottom.
    offsetY *= 1;

    // console.log("offsetY: " + offsetY);

    const strX = `${playerLocations.x[i] + offsetX}px`;
    const strY = `${playerLocations.y[i] + offsetY}px`;

    divs[i].style.left = strX;
    divs[i].style.bottom = strY;

    const ratioXtoY = 1;

    divs[i].style.height = `${playerDivHeightPercent}%`;

    const maxAvatarHeight = $('#option_display_max_avatar_height')[0].value;
    // console.log($(divs[i]).height());
    if ($(divs[i]).height() > maxAvatarHeight) {
      divs[i].style.height = `${maxAvatarHeight}px`;
    }

    // was trying to set width of div to be same as length of text but that doesnt work
    // cos guns also expand.

    //   if($($(divs[i])[0]).find(".role-p")[0] ){
    //     var canvas = document.createElement("canvas");
    //     var ctx=canvas.getContext("2d");

    //     ctx.font = $("#option_display_font_size_text").val(); + "px";
    //     var roleHere = $($(divs[i])[0]).find(".role-p")[0].innerHTML;
    //     console.log($($(divs[i])[0]).find(".role-p")[0].innerHTML);

    //     var widthOfRole = ctx.measureText(roleHere).width;

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

    divs[i].style.width = `${divs[i].offsetHeight * ratioXtoY}px`;

    const divHeightPos = $(divs[i]).position().top * 1.4;
    const translateValue = (-100 / (2 * b)) * (divHeightPos - 2 * b);

    $(divs[i]).css('transform', `translate(-50%, ${translateValue}%)`);

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

let lastPickNum = 0;
let lastMissionNum = 0;
function drawGuns() {
  $('.gun img').css('width', `${$('#mainRoomBox div').width()}px`);
  $('.gun').css('width', `${$('#mainRoomBox div').width()}px`);

  if (gameData && gameData.phase) {
    if (gameData.toShowGuns === false) {
      $('.gun').css('left', '50%');
      $('.gun').css('top', '50%');
      $('.gun').css('transform', 'translate(-50%,-50%)');
      $('.gun').removeClass('gunAfter');
      $('.gun').addClass('gunBefore');
    }
  } else {
    $('.gun').css('left', '50%');
    $('.gun').css('top', '50%');
    $('.gun').css('transform', 'translate(-50%,-50%)');
    $('.gun').removeClass('gunAfter');
    $('.gun').addClass('gunBefore');
  }

  if (
    gameData &&
    (lastPickNum !== gameData.pickNum || lastMissionNum !== gameData.missionNum)
  ) {
    // $(".gun").css("width", $("#mainRoomBox div").width() + "px");
    $('.gun').css('left', '50%');
    $('.gun').css('top', '50%');
    $('.gun').css('transform', 'translate(-50%,-50%)');
    $('.gun').removeClass('gunAfter');
    $('.gun').addClass('gunBefore');

    if (gameData && gameData.proposedTeam) {
      // gameData.propsedTeam
      for (let i = 0; i < gameData.proposedTeam.length; i++) {
        // console.log("not hidden stuff");
        // set the div string and add the gun

        const widOfGun = $('.gun').width();
        const heightOfGun = $('.gun').height();
        const useGun = $('#optionDisplayUseOldGameIcons')[0].checked;
        var icon;
        if (useGun === false) {
          icon = 'shieldOrange';
        } else {
          icon = 'gun';
        }
        if ($('#optionDisplayUseSmallIconsCrownShield')[0].checked === false) {
          if (icon === 'shieldOrange') {
            icon = 'shieldOrangeBig';
          }
        }
        const offsetGunPos = pics[icon].position;

        $($('.gun')[i]).animate(
          {
            top: `${$(
              $('#mainRoomBox div')[
              getIndexFromUsername(gameData.proposedTeam[i])
              ]
            ).position().top +
              heightOfGun * offsetGunPos.y
              }px`,
            left: `${$(
              $('#mainRoomBox div')[
              getIndexFromUsername(gameData.proposedTeam[i])
              ]
            ).position().left +
              widOfGun / offsetGunPos.x
              }px`,
          },
          500
        );
        $($('.gun')[i]).removeClass('gunBefore');
        $($('.gun')[i]).addClass('gunAfter');

        lastPickNum = gameData.pickNum;
        lastMissionNum = gameData.missionNum;
      }
    }
  } else {
    adjustGunPositions();
  }
}

function adjustGunPositions() {
  if (gameData && gameData.proposedTeam) {
    for (let i = 0; i < gameData.proposedTeam.length; i++) {
      const widOfGun = $('.gun').width();
      const heightOfGun = $('.gun').height();
      const useGun = $('#optionDisplayUseOldGameIcons')[0].checked;
      var icon;
      if (useGun === false) {
        icon = 'shieldOrange';
      } else {
        icon = 'gun';
      }
      if ($('#optionDisplayUseSmallIconsCrownShield')[0].checked === false) {
        if (icon === 'shieldOrange') {
          icon = 'shieldOrangeBig';
        }
      }
      const offsetGunPos = pics[icon].position;
      $($('.gun')[i]).css(
        'top',
        `${$(
          $('#mainRoomBox div')[
          getIndexFromUsername(gameData.proposedTeam[i])
          ]
        ).position().top +
        heightOfGun * offsetGunPos.y
        }px`
      );
      $($('.gun')[i]).css(
        'left',
        `${$(
          $('#mainRoomBox div')[
          getIndexFromUsername(gameData.proposedTeam[i])
          ]
        ).position().left +
        widOfGun / offsetGunPos.x
        }px`
      );
    }
  }
}

function drawTeamLeader() {
  let playerIndex;
  if (gameStarted === false) {
    playerIndex = 0;
  } else {
    playerIndex = gameData.teamLeader;
  }
  // set the div string and add the star
  if ($('#mainRoomBox div')[playerIndex]) {
    let str = $('#mainRoomBox div')[playerIndex].innerHTML;

    let icon;
    if ($('#optionDisplayUseOldGameIcons')[0].checked === true) {
      icon = 'star';
    } else if (
      $('#optionDisplayUseSmallIconsCrownShield')[0].checked === true
    ) {
      icon = 'crown';
    } else {
      icon = 'crownBig';
    }

    str = `${str}<img class='leaderIcon' src='${pics[icon].path}' style='${pics[icon].style}'>`;
    // update the str in the div
    $('#mainRoomBox div')[playerIndex].innerHTML = str;
  }
}

function drawClaimingPlayers(claimingPlayers) {
  $(buttons.claim)[0].innerText = 'Claim';
  // Initially when someone creates a room, enable claim button
  if (isSpectator === false) {
    $(buttons.claim).removeClass('disabled');
  }

  for (let i = 0; i < roomPlayersData.length; i++) {
    if (roomPlayersData[i].claim && roomPlayersData[i].claim === true) {
      if (
        $('#mainRoomBox div')[getIndexFromUsername(roomPlayersData[i].username)]
      ) {
        let str =
          $('#mainRoomBox div')[
            getIndexFromUsername(roomPlayersData[i].username)
          ].innerHTML;
        str += "<span><img src='pictures/claim.png' class='claimIcon'></span>";
        // update the str in the div
        $('#mainRoomBox div')[
          getIndexFromUsername(roomPlayersData[i].username)
        ].innerHTML = str;

        // $(".claimIcon")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
      }

      if (roomPlayersData[i].username === ownUsername) {
        $(buttons.claim)[0].innerText = 'Unclaim';
      }
    }
  }
}

function drawExitedPlayers(playersStillInRoom) {
  const arrayOfUsernames = [];
  for (var i = 0; i < roomPlayersData.length; i++) {
    arrayOfUsernames.push(roomPlayersData[i].username);
  }

  for (var i = 0; i < arrayOfUsernames.length; i++) {
    // if(roomPlayersData[i].claim && roomPlayersData[i].claim === true){
    if (playersStillInRoom.indexOf(arrayOfUsernames[i]) === -1) {
      // var j = playersStillInRoom.indexOf(arrayOfUsernames[i]);

      // if ($("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])]) {
      //     var str = $("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])].innerHTML;
      //     str = str + "<span><img src='pictures/leave.png' class='leaveIcon'></span>";
      //     //update the str in the div
      //     $("#mainRoomBox div")[getIndexFromUsername(arrayOfUsernames[i])].innerHTML = str;

      //     // $(".claimIcon")[0].style.top = $("#mainRoomBox div")[playerIndex].style.width;
      // }

      if ($('.avatarImgInRoom')[getIndexFromUsername(arrayOfUsernames[i])]) {
        $('.avatarImgInRoom')[
          getIndexFromUsername(arrayOfUsernames[i])
        ].classList.add('leftRoom');
      }
    } else if (
      $('.avatarImgInRoom')[getIndexFromUsername(arrayOfUsernames[i])]
    ) {
      $('.avatarImgInRoom')[
        getIndexFromUsername(arrayOfUsernames[i])
      ].classList.remove('leftRoom');
    }
  }
}

function checkSelectAvatarButtons(num) {
  if (typeof num === 'number') {
    // if they've selected the right number of players, then allow them to send
    if (
      countHighlightedAvatars() == num ||
      `${countHighlightedAvatars()}*` == num
    ) {
      // console.log("RUN THIS");
      // btnRemoveHidden("green");

      btnRemoveDisabled('green');
    } else {
      // btnRemoveHidden("green");
      enableDisableButtons();
    }
  } else if (typeof num === 'object' && num !== null && num !== undefined) {
    // if they've selected the right number of players, then allow them to send
    if (num.includes(countHighlightedAvatars()) === true) {
      btnRemoveDisabled('green');
    } else {
      // btnRemoveHidden("green");
      enableDisableButtons();
    }
  }
}
function enableDisableButtons() {
  // Hide the buttons. Unhide them as we need.
  document.querySelector(buttons.green).classList.add('hidden');
  document.querySelector(buttons.red).classList.add('hidden');
  // Claim button is never hidden, only disabled
  // document.querySelector(buttons["claim"]).classList.add("hidden");

  // Disable the buttons. Enable them as we need them.
  document.querySelector(buttons.green).classList.add('disabled');
  document.querySelector(buttons.red).classList.add('disabled');

  document.querySelector(buttons.claim).classList.add('disabled');

  // are we a player sitting down?
  let isPlayer = false;
  for (var i = 0; i < roomPlayersData.length; i++) {
    if (roomPlayersData[i].username === ownUsername) {
      // if we are a player sitting down, then yes, we are a player
      isPlayer = true;
      break;
    }
  }
  isSpectator = !isPlayer;

  // determine if we are spectator or not
  for (var i = 0; i < roomPlayersData.length; i++) {
    if (roomPlayersData[i].username === ownUsername) {
      isSpectator = false;
      break;
    }
  }

  // if we aren't a spectator, then remove the disable on the claim button
  if (isSpectator === false) {
    btnRemoveDisabled('claim');
  }

  if (gameStarted === false) {
    // Host
    if (ownUsername === getUsernameFromIndex(0)) {
      btnRemoveHidden('green');
      btnRemoveDisabled('green');
      btnSetText('green', 'Start');

      btnRemoveHidden('red');
      btnRemoveDisabled('red');
      btnSetText('red', 'Kick');

      // set the stuff for the kick modal buttons
      $(buttons.red).attr('data-toggle', 'modal');
      $(buttons.red).attr('data-target', '#kickModal');

      document.querySelector('#options-button').classList.remove('hidden');
    }
    // we are spectator
    else if (isSpectator === true) {
      btnRemoveHidden('green');
      btnRemoveDisabled('green');
      btnSetText('green', 'Join');
    }
    // we are a player sitting down, before game has started
    else {
      btnRemoveHidden('red');
      btnRemoveDisabled('red');
      btnSetText('red', 'Spectate');
    }

    // if we are not the host, then un-bind the red button from the kick modal
    if (ownUsername !== getUsernameFromIndex(0)) {
      $(buttons.red).attr('data-toggle', '');
      $(buttons.red).attr('data-target', '');
    }
  }
  // if game started and we are a player:
  else if (gameStarted === true && isSpectator === false) {
    if (gameData.buttons.green.hidden === false) {
      btnRemoveHidden('green');
    }
    if (gameData.buttons.green.disabled === false) {
      btnRemoveDisabled('green');
    }
    if (gameData.buttons.green.setText !== undefined) {
      btnSetText('green', gameData.buttons.green.setText);
    }

    if (gameData.buttons.red.hidden === false) {
      btnRemoveHidden('red');
    }
    if (gameData.buttons.red.disabled === false) {
      btnRemoveDisabled('red');
    }
    if (gameData.buttons.red.setText !== undefined) {
      btnSetText('red', gameData.buttons.red.setText);
    }
  }
}

function checkEntryExistsInArray(array, entry) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === entry) {
      return true;
    }
  }
  return false;
}

function countHighlightedAvatars() {
  const divs = document.querySelectorAll('#mainRoomBox div');
  let count = 0;
  for (let i = 0; i < divs.length; i++) {
    if (divs[i].classList.contains('highlight-avatar') === true) {
      count++;
    }
  }
  return count;
}

function getHighlightedAvatars() {
  let str = '';

  const divs = document.querySelectorAll('#mainRoomBox div');

  const arr = [];

  for (let i = 0; i < divs.length; i++) {
    if (divs[i].classList.contains('highlight-avatar') === true) {
      // we need to use getUsernameFromIndex otherwise
      // we will get info from the individual player
      // such as a percy seeing a merlin?.
      str = `${str + getUsernameFromIndex(i)} `;
      arr.push(getUsernameFromIndex(i));
    }
  }
  return arr;
}

function restoreHighlightedAvatars(usernames) {
  usernames.forEach((username) => {
    $($('#mainRoomBox div')[getIndexFromUsername(username)]).addClass(
      'highlight-avatar'
    );
  });
}

function getIndexFromUsername(username) {
  if (roomPlayersData) {
    for (let i = 0; i < roomPlayersData.length; i++) {
      if (roomPlayersData[i].username === username) {
        return i;
      }
    }
  } else {
    return false;
  }
}

function getUsernameFromIndex(index) {
  if (roomPlayersData[index]) {
    return roomPlayersData[index].username;
  }

  return false;
}

function strOfAvatar(playerData, alliance) {
  let picLink;
  if (alliance === 'res') {
    if (
      playerData.avatarImgRes &&
      $('#option_display_original_avatars')[0].checked === false &&
      (!playerData.avatarHide || playerData.avatarHide === false)
    ) {
      if (playerData.avatarImgRes.includes('http')) {
        picLink = playerData.avatarImgRes;
      } else {
        // stored locally, need to add the path to it
        picLink = `avatars/${playerData.avatarImgRes}`;
      }
    } else {
      picLink = pics.baseRes.path; // 'avatars/base-res.png';
    }
  } else if (
    playerData.avatarImgSpy &&
    $('#option_display_original_avatars')[0].checked === false &&
    (!playerData.avatarHide || playerData.avatarHide === false)
  ) {
    if (playerData.avatarImgSpy.includes('http')) {
      picLink = playerData.avatarImgSpy;
    } else {
      // stored locally, need to add the path to it
      picLink = `avatars/${playerData.avatarImgSpy}`;
    }
  } else {
    picLink = 'avatars/base-spy.png';
  }

  // add in the role of the player, and the percy info
  let role = '';

  // to get the lengths of the words or usernames
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${$('#option_display_font_size_text').val()}px sans-serif`;

  // can improve this code here
  if (gameStarted === true && gameData.phase === 'finished') {
    var roleWid =
      ctx.measureText(
        gameData.see.roles[getIndexFromUsername(playerData.username)]
      ).width + 20;

    role = `<p class='role-p' style='width: ${roleWid}px; margin: auto;'>${gameData.see.roles[getIndexFromUsername(playerData.username)]
      }</p>`;
  } else if (gameStarted === true && gameData !== undefined) {
    // if rendering our own player, give it the role tag
    if (playerData.username === ownUsername) {
      var roleWid = ctx.measureText(gameData.role).width + 20;
      role = `<p class='role-p' style='width: ${roleWid}px; margin: auto;'>${gameData.role}</p>`;
    } else if (gameData.see && gameData.see) {
      for (const key in gameData.see) {
        if (gameData.see.hasOwnProperty(key)) {
          const { roleTag } = gameData.see[key];
          const username = key;
          // console.log(username + " has role tag: " + roleTag);

          if (playerData.username === username) {
            var roleWid = ctx.measureText(roleTag).width + 20;
            role = `<p class='role-p' style='width: ${roleWid}px; margin: auto;'>${roleTag}</p>`;
          }
        }
      }
    }
  }

  // add in the hammer star
  let hammerStar = '';
  // console.log(playerData.username);
  // console.log(ctx.font);
  const nameWid = ctx.measureText(playerData.username).width;
  // console.log(nameWid);

  const widOfBox = $('#mainRoomBox div').width();
  // console.log(widOfBox);

  const littleProtrudingEdgeWid = (nameWid - widOfBox) / 2;
  const offsetDist = nameWid - littleProtrudingEdgeWid + 5;

  var searchTerm = 'hammer';
  if (docCookies.getItem('optionDisplayDarkTheme') === 'true') {
    searchTerm = 'hammer-dark';
  }

  if (gameStarted === false) {
    // give hammer star to the host
    if (playerData.username === getUsernameFromIndex(0)) {
      hammerStar =
        `<span class='hammerSpan' style='position: absolute; left: ${offsetDist}px; bottom: 2px;'>` +
        `<img style='width: 16px; height: 16px;' data-toggle='tooltip' data-placement='left' title='${icons[searchTerm].toolTip}' src=${icons[searchTerm].glyph}>` +
        '</span>';
    }
  } else if (playerData.username === getUsernameFromIndex(gameData.hammer)) {
    hammerStar =
      `<span class='hammerSpan' style='position: absolute; left: ${offsetDist}px; bottom: 2px;'>` +
      `<img style='width: 16px; height: 16px;' data-toggle='tooltip' data-placement='left' title='${icons[searchTerm].toolTip}' src=${icons[searchTerm].glyph}>` +
      '</span>';
  }

  let selectedAvatar = '';
  if (selectedAvatars[playerData.username] === 1) {
    selectedAvatar = 'selected-avatar-1';
    // console.log("HI");
  } else if (selectedAvatars[playerData.username] === 2) {
    selectedAvatar = 'selected-avatar-2';
  } else if (selectedAvatars[playerData.username] === 3) {
    selectedAvatar = 'selected-avatar-3';
  }

  // Set the colour of the button itself
  let colourToHighlightChatButton;
  const indexOfPlayer = getIndexFromUsername(playerData.username);
  var searchTerm = `player${indexOfPlayer}HighlightColour`;
  if (selectedChat[playerData.username] === true) {
    colourToHighlightChatButton = docCookies.getItem(searchTerm);
  } else {
    colourToHighlightChatButton = '';
  }

  let str = `<div usernameofplayer='${playerData.username}' class='playerDiv ${selectedAvatar}''>`;

  str += "<span class='avatarOptionButtons'>";
  str +=
    "<span id='highlightAvatarButton' class='glyphicon glyphicon-user avatarButton'></span>";
  str += `<span id='highlightChatButton' style='background-color: ${colourToHighlightChatButton};' class='glyphicon glyphicon glyphicon-menu-hamburger avatarButton'></span>`;
  str += '</span>';

  str +=
    '<span class="label label-success invisible approveLabel">Approve</span>';
  str += '<span class="label label-danger invisible rejectLabel">Reject</span>';
  str += '<span class="cardsContainer"></span>';

  str += `<img class='avatarImgInRoom' src='${picLink}'>`;
  str += `${"<p class='username-p' style='white-space:nowrap; position:relative;'>" +
    ' '
    }${playerData.username} ${hammerStar} </p>${role}</div>`;

  return str;
}

function changeView() {
  $('.lobby-container').toggleClass('inactive-window');
  $('.game-container').toggleClass('inactive-window');

  extendTabContentToBottomInRoom();

  setTimeout(() => {
    // console.log("redraw");
    draw();
  }, 1000);
}

// var chatBoxToNavTab = {
//     "all-chat-lobby": "",
//     "all-chat-room": "All Chat",
//     "room-chat-room": "Game Chat"
// }

function scrollDown(chatBox, hardScroll) {
  // example input of chatBox: all-chat-room

  if (chatBox[0] === '#') {
    chatBox = chatBox.slice(1, chatBox.length);
  }

  const searchStrScrollBox = `#${chatBox}`;
  const searchStrListBox = `#${chatBox}-list`;

  const scrollBox = $(searchStrScrollBox);
  const listBox = $(searchStrListBox);

  const searchStrBar = `#${chatBox}-bar`;

  const cutOffPixelsToScroll = 20;

  // console.log("diff is " + (listBox.height() - scrollBox.scrollTop() - scrollBox.height()) );

  // if the user is scrolled away

  let heightOfLastMessage = listBox.children().last().height();

  const lastMessages = listBox.children();

  if (lastMessages.length !== 0) {
    let lastMessage = lastMessages[lastMessages.length - 1];
    let extraHeight = $(lastMessage).height() - 20;

    let i = lastMessages.length - 1 - 1;
    while (lastMessage.classList.contains('myQuote')) {
      lastMessage = lastMessages[i];
      extraHeight += $(lastMessage).height() - 20;
      i--;
    }

    heightOfLastMessage = (lastMessages.length - 1 - i) * 20;

    // console.log("Height: " + heightOfLastMessage);

    if (
      listBox.height() - scrollBox.scrollTop() - scrollBox.height() >
      5 + heightOfLastMessage + extraHeight
    ) {
      // Show user that there is a new message with the red bar.
      // Show because the only time this will trigger is when a new message comes in anyway
      $(searchStrBar).removeClass('hidden');
    } else {
      scrollBox.scrollTop(listBox.height());
      $(searchStrBar).addClass('hidden');
    }
  }

  if (hardScroll === true) {
    // $("#mydiv").scrollTop($("#mydiv")[0].scrollHeight);

    scrollBox.scrollTop(scrollBox[0].scrollHeight);
  }
}

const arrayOfChatBoxes = [
  '#all-chat-lobby',
  '#all-chat-room',
  '#room-chat-room',
  '#all-chat-room2',
  '#room-chat-room2',
];

for (let i = 0; i < arrayOfChatBoxes.length; i++) {
  const chatBoxToEvent = arrayOfChatBoxes[i];

  // console.log("Chatbox is: " + chatBoxToEvent);

  $(chatBoxToEvent).on('scroll', function () {
    chatBox = `#${this.id}`;
    checkUnreadMessagesBar(chatBox);
  });
}

function checkUnreadMessagesBar(chatBox) {
  // console.log("chatbox : " + chatBox);

  const searchStrScrollBox = `${chatBox}`;
  const searchStrListBox = `${chatBox}-list`;
  const searchStrBar = `${chatBox}-bar`;

  const scrollBox = $(searchStrScrollBox);
  const listBox = $(searchStrListBox);

  // console.log("SCROLL");
  // console.log("IF: " + !(listBox.height() - scrollBox.scrollTop() - scrollBox.height() > 20));

  // if user is at the bottom
  if (!(listBox.height() - scrollBox.scrollTop() - scrollBox.height() > 20)) {
    $(searchStrBar).addClass('hidden');
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

// some setups result in collisions of avatars
// so set up some custom degree positions for avatars at certain
// game sizes

// key = num of players in game
// 2nd key = player position
// value = angle
const customSteps = {
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
    6: 325,
  },
  8: {
    1: 35,

    3: 145,
    5: 215,

    7: 325,
  },
  9: {
    1: 30,
    2: 70,
    3: 140,
    4: 167,

    5: 193,
    6: 220,
    7: 290,
    8: 330,
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
    9: 347,
  },
};

function generatePlayerLocations(numOfPlayers, a, b) {
  // CONICS :D
  const x_ = [];
  const y_ = [];
  const step = 360 / numOfPlayers;
  const tiltOffset = 0;
  // console.log("Step: " + step);

  // for 6p and 10p, rotate slightly so that usernames dont collide
  // with the role text
  if (numOfPlayers === 6) {
    // var tiltOffset = step / 2;
  }

  for (let i = 0; i < numOfPlayers; i++) {
    if (customSteps[numOfPlayers] && customSteps[numOfPlayers][i]) {
      x_[i] =
        a *
        Math.cos(toRadians(customSteps[numOfPlayers][i] + 90 + tiltOffset)) *
        1;
      y_[i] =
        b *
        Math.sin(toRadians(customSteps[numOfPlayers][i] + 90 + tiltOffset)) *
        1;
    } else {
      // get the coordinates. Note the +90 is to rotate so that
      // the first person is at the top of the screen
      x_[i] = a * Math.cos(toRadians(step * i + 90 + tiltOffset)) * 1;
      y_[i] = b * Math.sin(toRadians(step * i + 90 + tiltOffset)) * 1;
      // x_[i] = a*(Math.cos(toRadians((step*i) + 90)));
      // y_[i] = b*(Math.sin(toRadians((step*i) + 90)));
    }
  }

  const object = {
    x: x_,
    y: y_,
  };
  return object;
}

// Note this function will also draw the card history
function drawVoteHistory(data) {

  if (!data.voteHistory) {
    return;
  }

  // Vote history:
  const numOfPicksPerMission = [];
  var str = '';
  // top row where missions are displayed
  // extra <td> set is for the top left corner of the table
  str += '<tr><td></td>';

  for (var i = 0; i < data.missionNum; i++) {
    var colour;
    if (data.missionHistory[i] === 'succeeded') {
      colour = '#99c4ff';
    } else if (data.missionHistory[i] === 'failed') {
      colour = '#fa4f4f';
    } else {
      colour = 'transparent';
    }

    str += `<td style='width: 11em; background-color: ${colour}; color: black;' colspan='' class='missionHeader${i + 1
      }'>Mission ${i + 1}</td>`;
  }
  str += '</tr>';

  const keyArray = [];
  // push the first person first
  keyArray[0] = roomPlayersData[0].username;

  // for every username in a clockwise direction
  for (var i = roomPlayersData.length - 1; i > 0; i--) {
    keyArray[roomPlayersData.length - i] = roomPlayersData[i].username;
  }

  for (let k = 0; k < keyArray.length; k++) {
    str += '<tr>';
    // print username in the first column
    str += `<td>${keyArray[k]}</td>`;

    // Individual mission voteHistory
    // for every mission
    for (var i = 0; i < data.voteHistory[keyArray[k]].length; i++) {
      numOfPicksPerMission[i] = 0;

      // for every pick
      for (let j = 0; j < data.voteHistory[keyArray[k]][i].length; j++) {
        // console.log(data.voteHistory[key][i][j]);

        str += `<td class='${data.voteHistory[keyArray[k]][i][j]}''>`;

        if (data.voteHistory[keyArray[k]][i][j].includes('VHpicked') === true) {
          str += "<i class='glyphicon glyphicon-ok'></i>";
        }

        str += '</td>';
        numOfPicksPerMission[i]++;
      }
    }
    str += '</tr>';
  }

  $('.voteHistoryTableClass')[0].innerHTML = str;
  $('.voteHistoryTableClass')[1].innerHTML = str;

  // set the right colspans for the mission headers
  for (var i = 0; i < numOfPicksPerMission.length; i++) {
    const id = `.missionHeader${i + 1}`;

    const allHeaders = $(id);

    $(id).attr('colspan', numOfPicksPerMission[i]);
  }

  // Card history:

  var str = "<h5 style='margin: 0;'><b><u>Card history:</u></b></h5>";

  for (const key in data.publicData.cards) {
    if (data.publicData.cards.hasOwnProperty(key) === true) {
      const c = data.publicData.cards[key];

      if (c.history !== undefined && c.name !== undefined) {
        str += `<em>${c.name}: </em>`;
      }

      c.history.forEach((username) => {
        str += `${username} -> `;
      });
    }

    str = str.slice(0, str.length - 4);
    str += '<br>';
  }

  $('.cardHistoryClass')[0].innerHTML = str;
  $('.cardHistoryClass')[1].innerHTML = str;

  //  ProNub -> Bot2 -> Bot123 ->
}

function getOptions() {
  // console.log($("#rolesCardsButtonGroup label"));
  const rolesCards = $('#rolesCardsButtonGroup label');

  const selectedRolesCards = [];
  for (let i = 0; i < rolesCards.length; i++) {
    // Check if this role/card is selected or not
    let isActive = false;
    for (let j = 0; j < rolesCards[i].classList.length; j++) {
      if (rolesCards[i].classList[j] === 'active') {
        isActive = true;
        break;
      }
    }
    // If it is not selected, don't add it.
    if (isActive === false) {
      continue;
    }

    const name = rolesCards[i].innerText.trim();
    selectedRolesCards.push(name);
  }
  // console.log(selectedRolesCards);

  return selectedRolesCards;
}

function getKickPlayers() {
  const data = {};

  for (let i = 0; i < roomPlayersData.length; i++) {
    // console.log(unescapeHtml(roomPlayersData[i].username));
    // if ($("#" + roomPlayersData[i].username)[0].checked === true) {
    if (
      $(`#${$.escapeSelector(unescapeHtml(roomPlayersData[i].username))}`)[0]
        .checked === true
    ) {
      data[roomPlayersData[i].username] = true;
    }
  }

  return data;
}

const gameEndSoundPlayed = false;
function resetAllGameData() {
  roomId = undefined;
  // reset all the variables
  roomPlayersData = undefined;
  seeData = undefined;
  gameData = undefined;
  gameStarted = false;
  numPlayersOnMission = [];
  inRoom = false;
  // note do not reset our own username.
  isSpectator = false;

  selectedAvatars = {};

  print_gameplay_text_game_started = false;
  print_gameplay_text_picked_team = false;
  print_gameplay_text_vote_results = false;
  print_last_mission_num = 1;

  oldProposedTeam = false;

  // hide the options cog
  document.querySelector('#options-button').classList.add('hidden');

  // reset room-chat
  // console.log("RESET ROOM CHAT");
  $('.room-chat-list').html('');

  // reset the vh table
  // $("#voteHistoryTable")[0].innerHTML = "";
  $('.voteHistoryTableClass')[0].innerHTML = '';
  $('.voteHistoryTableClass')[1].innerHTML = '';

  $('.cardHistoryClass')[0].innerHTML = '';
  $('.cardHistoryClass')[1].innerHTML = '';

  $('#missionsBox').addClass('invisible');

  lastPickNum = 0;
  lastMissionNum = 0;

  // leaving room so reset the possible autocomplete stuff
  // autoCompleteStrs = currentOnlinePlayers;
}

let tempVar = 0;

const gameContainer = $('.game-container')[0];
const tabNumber = $('#tabs1');
const tabContainer = $('.tab-content');
const navTabs = $('.nav-tabs');

function extendTabContentToBottomInRoom() {
  // extending the tab content to the bottom of the page:

  // 20 pixel diff for navbar

  if ($('#tabs1 .nav').height() > 40) {
    // console.log("ASDF");
    tempVar = 37;
  } else {
    tempVar = 0;
  }

  const newHeight2 =
    Math.floor(gameContainer.offsetHeight - tabNumber.position().top) -
    20 -
    tempVar;
  // console.log("h: " + newHeight2);
  // console.log("new height 2: " + newHeight2);

  tabNumber[0].style.height = `${Math.floor(newHeight2 * 1)}px`;

  tabContainer.height(`${Math.floor(newHeight2 /* - navTabs.height() */)}px`);
}

let lastChatBoxCommand = '';
function checkMessageForCommands(message, chatBox) {
  arrayMessage = message.split(' ');
  // console.log("arr message: " + arrayMessage);

  if (message[0] === '/') {
    // console.log("COMMAND INPUT DETECTED");
    let validCommandFound = false;

    // need to change this to only up to the first space
    messageCommand = arrayMessage[0].slice(1, arrayMessage[0].length);

    let commandCalled = '';

    // cycle through the commands and try to find the command.
    for (var key in commands) {
      if (commands.hasOwnProperty(key)) {
        // console.log(key + " -> " + commands[key]);
        if (messageCommand === commands[key].command) {
          // console.log("Command: " + commands[key].command + " called.");
          commandCalled = commands[key].command;
          validCommandFound = true;
          break;
        }
      }
    }

    if (adminCommands) {
      for (var key in adminCommands) {
        if (adminCommands.hasOwnProperty(key)) {
          // console.log(key + " -> " + commands[key]);
          if (messageCommand === adminCommands[key].command) {
            // console.log("admin");
            // console.log("Command: " + commands[key].command + " called.");
            commandCalled = adminCommands[key].command;
            validCommandFound = true;

            break;
          }
        }
      }
    }

    if (modCommands) {
      for (var key in modCommands) {
        if (modCommands.hasOwnProperty(key)) {
          // console.log(key + " -> " + commands[key]);
          if (messageCommand === modCommands[key].command) {
            // console.log("mods");
            // console.log("Command: " + commands[key].command + " called.");
            commandCalled = modCommands[key].command;
            validCommandFound = true;

            break;
          }
        }
      }
    }

    if (TOCommands) {
      for (var key in TOCommands) {
        if (TOCommands.hasOwnProperty(key)) {
          // console.log(key + " -> " + commands[key]);
          if (messageCommand === TOCommands[key].command) {
            commandCalled = TOCommands[key].command;
            validCommandFound = true;
            break;
          }
        }
      }
    }

    if (validCommandFound === false) {
      // console.log("Command invalid");
      const str = `/${messageCommand} is not a valid command. Type /help for a list of commands.`;
      const data = {
        message: str,
        classStr: 'server-text',
        dateCreated: new Date(),
      };
      if (chatBox === 'allChat') {
        addToAllChat(data);
      } else if (chatBox === 'roomChat') {
        addToRoomChat(data);
      }
    }
    // If game hasn't started and we have the roomchat command, don't do anything.
    else if (gameData === undefined && messageCommand === 'roomchat') {
      // Do nothing
    } else {
      // sending command to server
      // console.log("Sending command: " + messageCommand + " to server.");
      // console.log("ASDF");
      socket.emit('messageCommand', {
        command: messageCommand,
        args: arrayMessage,
      });
    }

    lastChatBoxCommand = chatBox;
    return true;
  }

  return false;
}

function updateDarkTheme(checked) {
  if (checked === true) {
    $('body')[0].classList.add('dark');
    $('.well').addClass('dark');
    $('input').addClass('dark');
    $('textarea').addClass('dark');
    $('.btn-default').addClass('btn-inverse');
    $('.navbar').addClass('navbar-inverse');
    $('#playerHighlightColourButton').addClass('buttonDark');
    $('#playerHighlightColourButton2').addClass('buttonDark');
    $('#removeHighlight').addClass('buttonDark');
    $('#removeHighlight2').addClass('buttonDark');
  } else {
    $('body')[0].classList.remove('dark');
    $('.well').removeClass('dark');
    $('input').removeClass('dark');
    $('textarea').removeClass('dark');
    $('.btn-default').removeClass('btn-inverse');
    $('.navbar').removeClass('navbar-inverse');
    $('#playerHighlightColourButton').removeClass('buttonDark');
    $('#playerHighlightColourButton2').removeClass('buttonDark');
    $('#removeHighlight').removeClass('buttonDark');
    $('#removeHighlight2').removeClass('buttonDark');
  }

  draw();
}

function updateTwoTabs(checked) {
  if (checked === true) {
    $('#tabs1').addClass('col-xs-6');
    $('#tabs1').addClass('tabs1TwoTabs');
    $('#tabs2').addClass('tabs2TwoTabs');
    $('#tabs2').removeClass('displayNoneClass');
    $('#reportDivRoom').addClass('displayNoneReportClass')
  } else {
    $('#tabs1').removeClass('col-xs-6');
    $('#tabs2').addClass('displayNoneClass');
    $('#reportDivRoom').removeClass('displayNoneReportClass')
  }
}

function unescapeHtml(unsafe) {
  return unsafe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function scaleGameComponents() {
  gameTableHeight = $('#mainRoomBox').height();

  var startScalingHeight = 400;
  var maxHeightOfBoxes = 60; // in px
  var scaleFactor = maxHeightOfBoxes / startScalingHeight;

  var setHeightOfMissionBox = gameTableHeight * scaleFactor;

  var ratioToReduce = setHeightOfMissionBox / maxHeightOfBoxes;

  // console.log("Reduce by: " + ratioToReduce);
  if (ratioToReduce > 1) {
    ratioToReduce = 1;
  }

  // Scale the middle boxes
  $('#missionsBox').css(
    'transform',
    `translateX(-50%) scale(${ratioToReduce})`
  );

  // Scale the guns/pick icon
  const playerDivHeightRatio = $('.playerDiv').height() / 128;
  const useGun = docCookies.getItem('optionDisplayUseOldGameIcons');
  let maxHeight = 0;
  let maxWidth = 0;
  // Use shield
  if (useGun === 'false') {
    if ($('#optionDisplayUseSmallIconsCrownShield')[0].checked === true) {
      maxHeight = pics.shieldOrange.maxDims.y;
      maxWidth = pics.shieldOrange.maxDims.x;
    } else {
      maxHeight = pics.shieldOrangeBig.maxDims.y;
      maxWidth = pics.shieldOrangeBig.maxDims.x;
    }
  }
  // Use gun
  else {
    maxHeight = pics.gun.maxDims.y;
    maxWidth = pics.gun.maxDims.x;
  }

  // $(".gunImg").css("height", "100%");
  // $(".gunImg").css("height", "100%");
  // needs to be scaled this way as reducing img size still overshoots
  $('.gunImg').css('max-height', `${maxHeight * playerDivHeightRatio}px`);
  $('.gunImg').css('max-width', `${maxWidth * playerDivHeightRatio}px`);

  // Scale the crown/leader star in the same way
  const useStar = docCookies.getItem('optionDisplayUseOldGameIcons');
  // Use star
  if (useStar === 'true') {
    maxHeight = pics.star.maxDims.y;
    maxWidth = pics.star.maxDims.x;
  }
  // Use crown
  else if ($('#optionDisplayUseSmallIconsCrownShield')[0].checked === true) {
    maxHeight = pics.crown.maxDims.y;
    maxWidth = pics.crown.maxDims.x;
  } else {
    maxHeight = pics.crownBig.maxDims.y;
    maxWidth = pics.crownBig.maxDims.x;
  }
  $('.leaderIcon').css(
    'max-height',
    `${maxHeight * (playerDivHeightRatio - 0.05)}px`
  );
  $('.leaderIcon').css('max-width', `${maxWidth * playerDivHeightRatio}px`);

  // Scale the Assassin icon in the same way
  const useBullet = docCookies.getItem('optionDisplayUseOldGameIcons');
  // Use bullet
  if (useBullet === 'true') {
    maxHeight = parseInt(pics.bullet.maxHeight);
  }
  // Use dagger
  else {
    maxHeight = parseInt(pics.dagger.maxHeight);
  }
  $('.assassinateIcon').css(
    'max-height',
    `${maxHeight * playerDivHeightRatio}px`
  );

  // Scale the approve reject labels
  var startScalingHeight = 200;
  var maxHeightOfBoxes = 60; // in px
  var scaleFactor = maxHeightOfBoxes / startScalingHeight;

  var setHeightOfMissionBox = gameTableHeight * scaleFactor;

  var ratioToReduce = setHeightOfMissionBox / maxHeightOfBoxes;
  if (ratioToReduce > 1) {
    ratioToReduce = 1;
  }
  // also scale the approve reject buttons
  $('.approveLabel').css(
    'transform',
    `translateX(-50%) scale(${ratioToReduce})`
  );
  $('.rejectLabel').css(
    'transform',
    `translateX(-50%) scale(${ratioToReduce})`
  );
}

const sounds = {
  slap: 'slap.mp3',
  buzz: 'ding.mp3',
  ding: 'ding.mp3',
  'game-start': 'game-start.mp3',
  'game-end': 'game-end.mp3',
  highDing: 'highDing.mp3',
  'game-start-ready': 'game-start-ready.mp3',
  pat: 'pat.mp3',
  poke: 'poke.mp3',
  punch: 'punch.mp3',
  hug: 'hug.mp3',
};

// get all the sound files and prepare them.
const soundFiles = {};
for (const key in sounds) {
  if (sounds.hasOwnProperty(key)) {
    soundFiles[key] = new Audio(`sounds/${sounds[key]}`);
  }
}

function playSound(soundToPlay) {
  if ($('#option_notifications_sound_enable')[0].checked === false) {
    return false;
  }
  if (
    gameStarted &&
    $('#option_notifications_sound_enable_in_game')[0].checked === false
  ) {
    return false;
  }

  soundFiles[soundToPlay].volume =
    $('#option_notifications_sound_volume')[0].value / 100;
  soundFiles[soundToPlay].play();
}

function displayNotification(title, body, icon, tag) {
  if (
    Notification.permission === 'granted' &&
    $('#option_notifications_desktop_enable')[0].checked === true
  ) {
    const options = {
      body,
      icon,
      tag,
    };

    const notif = new Notification(title, options);
  }
}

function showYourTurnNotification(ToF) {
  // Display the green button if its your turn.
  if (ToF === true) {
    $(buttons.green).removeClass('hidden');
  } else if (ToF === false) {
    $(buttons.green).addClass('hidden');
  } else {
    console.log('error in show your turn notifications');
  }
}

function btnRemoveHidden(btnStr) {
  document.querySelector(buttons[btnStr]).classList.remove('hidden');
}
function btnRemoveDisabled(btnStr) {
  document.querySelector(buttons[btnStr]).classList.remove('disabled');
}
function btnSetText(btnStr, text) {
  document.querySelector(buttons[btnStr]).innerText = text;
}
