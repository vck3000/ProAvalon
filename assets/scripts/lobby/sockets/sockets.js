//= =====================================
// SOCKET ROUTES
//= =====================================

socket.on('allChatToClient', (data) => {
  if (data.type === 'lastLoggedIn') {
    const date = new Date(data.lastLoggedInDate);
    data.message = `You last logged in on ${date.toDateString()} at ${date.toLocaleTimeString()}.`;
  }
  addToAllChat(data);
});

socket.on('roomChatToClient', (data) => {
  addToRoomChat(data);
});

socket.on('joinedGameSuccess', (data) => {
  isSpectator = false;
});

let intervalId = 0;
let attemptNumber = 0;
const MAX_NUM_TRIES = 5;

function stopReconnectInterval() {
  if (intervalId) {
    console.log('Stopping reconnect interval');
    clearInterval(intervalId);
    intervalId = 0;
    attemptNumber = 0;
  }
}

var firstTimeConnected = true;
socket.on('connect', () => {
  console.log('Connected');
  hideDangerAlert();
  stopReconnectInterval();

  if (roomId !== undefined) {
    const roomIdCopy = roomId;
    leaveRoom();
    joinRoom(roomIdCopy);
  }

  if (!firstTimeConnected) {
    Swal.fire({
      text: 'Reconnected!',
      toast: true,
      type: 'success',
      position: 'top',
      timer: 3000,
      showConfirmButton: false,
    });
  }
  firstTimeConnected = false;
});

function attemptReconnect() {
  attemptNumber++;
  console.log("Attempt reconnect", attemptNumber);

  if (attemptNumber >= MAX_NUM_TRIES) {
    stopReconnectInterval();
    showDangerAlert(`Failed to reconnect...`);
    return;
  }
  socket.connect();

  showDangerAlert(
    `You have disconnected. Attempting to reconnect... (${attemptNumber}/${MAX_NUM_TRIES})`
  );
}

let autoReconnect = true;
let serverRestarting = false;

socket.on('dont-reconnect', () => {
  autoReconnect = false;
});

socket.on('disconnect', () => {
  if (serverRestarting) {
    showDangerAlert(`You have been disconnected. Please refresh the page.`);
    return;
  }

  if (!autoReconnect) {
    showDangerAlert(
      `You have logged on another device and have been disconnected.`
    );
  } else {
    const chats = $('.chat-list');
    for (const chat of chats) {
      chat.innerHTML = '';
    }

    setTimeout(() => {
      attemptReconnect();
    }, 500);

    if (!intervalId) {
      intervalId = setInterval(() => {
        attemptReconnect();
      }, 5000);
    }
  }
});

let mutedPlayers = [];
socket.on('updateMutedPlayers', (data) => {
  mutedPlayers = data;
  // console.log("Muted players: ");
  // console.log(mutedPlayers);
});

socket.on('checkSettingsResetDate', (serverResetDate) => {
  serverResetDate = new Date(serverResetDate);
  // console.log("check reset date");

  // console.log(docCookies.hasItem("lastSettingsResetDate"));

  // check if we need to reset settings
  if (docCookies.hasItem('lastSettingsResetDate')) {
    const lastDate = new Date(docCookies.getItem('lastSettingsResetDate'));

    // console.log(serverResetDate);
    // console.log(lastDate);

    // console.log(serverResetDate > lastDate);

    if (serverResetDate > lastDate) {
      resetSettings();
    }
  } else {
    docCookies.setItem(
      'lastSettingsResetDate',
      new Date().toString(),
      Infinity
    );
  }
});

socket.on('checkNewUpdate', (data) => {
  serverLastUpdateDate = new Date(data.date);
  // console.log("check reset date");

  // console.log(docCookies.hasItem("lastUpdateNotificationDate"));

  // check if we need to reset settings
  if (docCookies.hasItem('lastUpdateNotificationDate')) {
    const lastDate = new Date(docCookies.getItem('lastUpdateNotificationDate'));

    // console.log(serverLastUpdateDate);
    // console.log(lastDate);

    // console.log(serverLastUpdateDate > lastDate);

    if (serverLastUpdateDate > lastDate) {
      Swal({
        title: 'New updates!',
        html: data.msg,
        type: 'info',
        allowEnterKey: false,
      });
    }

    docCookies.setItem(
      'lastUpdateNotificationDate',
      new Date().toString(),
      Infinity
    );
  } else {
    Swal({
      title: 'New updates!',
      html: data.msg,
      type: 'info',
      allowEnterKey: false,
    });

    docCookies.setItem(
      'lastUpdateNotificationDate',
      new Date().toString(),
      Infinity
    );
  }
});

socket.on('mannounce', (str) => {
  Swal({
    title: 'Moderator announcement!',
    html: str,
    type: 'info',
    allowEnterKey: false,
  });
});

socket.on('checkNewPlayerShowIntro', () => {
  if (docCookies.hasItem('seenNewPlayerIntro')) {
  } else {
    Swal({
      title: 'Welcome!',
      html: 'Welcome to ProAvalon! Here we play The Resistance Avalon competitively against the best of the best social deduction players around the world. Please check the forums to acquaint yourself with the various strategies that we use while playing this game online.',
      type: 'success',
      allowEnterKey: false,
    });

    docCookies.setItem('seenNewPlayerIntro', new Date().toString(), Infinity);
  }
});

socket.on('serverRestartWarning', () => {
  const message = `<div style='text-align: left;'>
    <style>
        #swalUl li{
            padding-bottom: 3%;
        }

    </style>
    <ul id="swalUl">
        <li>In order for me to update the site, the server must be restarted in a few seconds. </li>

        <li>Any running games will be saved and you will be able to continue your games when you log in again.</li>

        <li>The server will only be down for a brief moment, at most 30 seconds.</li>

        <li>I apologise for the inconvenience caused. Thank you.</li>
    </ul>
    
    </div>`;

  Swal({
    title: 'Server restarting soon!',
    html: message,
    type: 'info',
    allowEnterKey: false,
  }).then(() => {
    // location.reload();
  });
});

socket.on('server-restarting', () => {
  autoReconnect = false;
  serverRestarting = true;
  socket.disconnect();
  socket.destroy();
  Swal({
    title: 'Server restarting',
    html: 'The server is restarting for an update.<br>Sit tight!',
    type: 'info',
    allowEnterKey: false,
  });
});

socket.on('refresh', (data) => {
  location.reload();
});

socket.on('muteNotification', (modAction) => {
  const message = `You will not be allowed to talk. You will not be allowed to play.<br><br>

    You are allowed to spectate games, use the forums and check out profiles. <br><br>

    Your mute will be released on ${new Date(modAction.whenRelease)}. <br><br>
    
    The description of your ban is: ${modAction.descriptionByMod}<br><br>
    
    You can exit this message by pressing escape.`;

  Swal({
    title: 'You have been muted.',
    html: message,
    type: 'warning',
    // buttons: false,

    allowEnterKey: false,
  }).then(() => {
    // location.reload();
  });
});

function resetSettings() {
  Swal({
    title: 'New updates!',
    html: 'Due to some new updates, a reset of your personal settings is required.<br><br>I apologise for the inconvenience caused :(.',
    type: 'warning',
    allowEnterKey: false,
  }).then(() => {
    // get all the keys
    const keys = docCookies.keys();

    // remove each item
    for (let i = 0; i < keys.length; i++) {
      docCookies.removeItem(keys[i]);
    }
    docCookies.setItem(
      'lastSettingsResetDate',
      new Date().toString(),
      Infinity
    );

    Swal({
      title: 'Poof! Your settings have been reset!',
      type: 'success',
    }).then(() => {
      // reload
      location.reload();
    });
  });
}

socket.on('gameEnded', (data) => {
  if ($('#option_notifications_sound_game_ending')[0].checked === true) {
    playSound('game-end');
  }

  if ($('#option_notifications_desktop_game_ending')[0].checked === true) {
    displayNotification(
      'Game has ended!',
      '',
      'avatars/base-spy.png',
      'gameEnded'
    );
  }
});

socket.on('openModModal', (data) => {
  $('#modModal').modal('show');
});

let currentOnlinePlayers;
socket.on('update-current-players-list', (currentPlayers) => {
  // console.log("update the current player list request received");
  // console.log(currentPlayers);
  // remove all the li's inside the table
  $('#current-players-table tbody tr td').remove();
  $('#current-players-table tbody tr').remove();

  currentOnlinePlayers = currentPlayers;
  autoCompleteStrs = currentPlayers.map((a) => a.displayUsername);

  unrankedPlayers = currentPlayers.filter(
    (x) => x.ratingBracket === 'unranked'
  );
  rankedPlayers = currentPlayers.filter(
    (x) => !(x.ratingBracket === 'unranked')
  );

  // append each ranked player into the list first.
  rankedPlayers.forEach((player) => {
    // if the current player exists, add it
    if (player) {
      str = `<tr> <td>${player.displayUsername} ${generateBadgeString(player.badge)}</td> <td align="right">${player.ratingBadge} ${player.playerRating}</td> </tr>`;
      $('#current-players-table tbody').append(str);
    }
  });

  // second append all unranked players to the bottom
  unrankedPlayers.forEach((player) => {
    // if the current player exists, add it
    if (player) {
      str = `<tr> <td>${player.displayUsername} ${generateBadgeString(player.badge)}</td> <td align="right">${player.ratingBadge} ${player.playerRating}</td> </tr>`;
      $('#current-players-table tbody').append(str);
    }
  });

  $('.player-count').text(currentPlayers.length);
});

// Defines the order in which the game statuses will be sorted. If there is a new game status that is not
// in the object, it will default to the last position.
const gameStatusOrder = { 'Waiting': 0, 'Game in progress': 1, 'Paused': 2, 'Frozen': 3, 'Finished': 4 , 'Voided': 5};
const defaultGameOrder = Object.keys(gameStatusOrder).length;

socket.on('update-current-games-list', (currentGames) => {
  // remove all the entries inside the table:
  $('#current-games-table tbody tr td').remove();
  $('#current-games-table tbody tr').remove();

  $('.games-count').text(currentGames.filter((game) => game).length);

  currentGames
    // filter games that exist
    .filter(currentGame => currentGame)
    // sort the games by status so that games in progress show first and games that have finished show last.
    .sort((a, b) => (gameStatusOrder[a.status] ?? defaultGameOrder) - (gameStatusOrder[b.status] ?? defaultGameOrder))
    // append each game to the list
    .forEach((currentGame) => {
      let lockStr = '';
      if (currentGame.passwordLocked === true) {
        lockStr = " <span class='glyphicon glyphicon-lock'></span>";
      }
      // console.log("lock str: " + lockStr);

      if (currentGame.missionHistory) {
        var missionHistoryStr =
          "<span style='white-space:nowrap; display: inline-block;'>";
        const fontSize = `${docCookies.getItem('optionDisplayFontSize')}px`;

        currentGame.missionHistory.forEach((hist) => {
          if (hist === 'succeeded') {
            missionHistoryStr += `<span class='missionBoxSucceed lobbyMissionBox' style='height: ${fontSize}; width: ${fontSize};'></span>`;
          } else {
            missionHistoryStr += `<span class='missionBoxFail lobbyMissionBox' style='height: ${fontSize}; width: ${fontSize};'></span>`;
          }
        });
        for (let i = 0; i < 5 - currentGame.missionHistory.length; i++) {
          missionHistoryStr += `<span class='missionBoxDefault lobbyMissionBox' style='height: ${fontSize}; width: ${fontSize};'></span>`;
        }

        missionHistoryStr += '</span>';
      } else {
        var missionHistoryStr = '';
      }

      const str =
        `<tr> <td><strong>Room#${currentGame.roomId}${lockStr}</strong>: ${currentGame.status} [${currentGame.numOfPlayersInside}/${currentGame.maxNumPlayers}]` +
        '<hr>' +
        `Spectators: ${currentGame.numOfSpectatorsInside}
                <br>Game mode: ${currentGame.gameMode}
                <br> Type: ${currentGame.gameType}
                <br>Host: ${currentGame.hostUsername}
                <br>${missionHistoryStr}
                </td> </tr>`;

      $('#current-games-table tbody').append(str);

      // grab all the td's and then add an event listener
      const allTds = document.querySelectorAll(
        '#current-games-table tbody tr td'
      );

      // add the event listener to the last td added.
      allTds[allTds.length - 1].addEventListener('click', () => {
        // JOIN THE ROOM

        // console.log("RESET GAME DATA ON JOIN ROOM");
        resetAllGameData();

        joinRoom(currentGame.roomId);
      });
    });

  // remove the ugly remaining border when no games are there to display
  if (
    document.querySelectorAll('#current-games-table tbody tr td').length === 0
  ) {
    document
      .querySelectorAll('#current-games-table')[0]
      .classList.add('current-games-table-off');
    document
      .querySelectorAll('#current-games-table')[0]
      .classList.remove('current-games-table-on');
  } else {
    document
      .querySelectorAll('#current-games-table')[0]
      .classList.add('current-games-table-on');
    document
      .querySelectorAll('#current-games-table')[0]
      .classList.remove('current-games-table-off');
  }
});

socket.on('auto-join-room-id', (roomId_, newRoomPassword) => {
  // Received a request from server to auto join and sit down.
  // This is called when we create a room.
  socket.emit('join-room', roomId_, newRoomPassword);
  socket.emit('join-game', roomId_);
  isSpectator = false;
  roomId = roomId_;
  // change the view to the room instead of lobby
  changeView();
});

socket.on('match-found-join-room', (data) => {
  if (roomId !== undefined) {
    leaveRoom();
  }

  resetAllGameData();
  socket.emit('join-room', data.roomId);

  roomId = data.roomId;
  isSpectator = false;

  changeView();
});

socket.on('update-status-message', (data) => {
  if (data) {
    $('#status').textContent = data;
  }
});

socket.on('update-room-players', (data) => {
  // if an extra person joins the game, play the chime

  // console.log("update room players");

  // showDangerAlert("Test");
  oldData = roomPlayersData;
  // var x = $("#typehead").parent().width();
  roomPlayersData = data;

  // remove all the li's inside the list
  // $("#mainRoomBox div").remove();

  // console.log("update room players");
  // console.log(data);

  // update spectators list
  // updateSpectatorsList();
  draw();

  if (
    oldData &&
    oldData.length < roomPlayersData.length &&
    roomPlayersData.length > 1
  ) {
    if (
      $('#option_notifications_sound_players_joining_game')[0].checked === true
    ) {
      playSound('ding');
    }

    if (
      $('#option_notifications_desktop_players_joining_game')[0].checked ===
      true
    ) {
      displayNotification(
        `New player in game!  [${roomPlayersData.length}p]`,
        `${roomPlayersData[roomPlayersData.length - 1].username
        } has joined the game!`,
        'avatars/base-res.png',
        'newPlayerInGame'
      );
    }
  }
});

let oldSpectators = [];
socket.on('update-room-spectators', (spectatorUsernames) => {
  $('#spectators-table tbody tr td').remove();
  $('#spectators-table tbody tr').remove();

  // append each player into the list
  spectatorUsernames.forEach((spectator) => {
    // if the current game exists, add it
    if (spectator) {
      const str = `<tr> <td> ${spectator}</td> </tr>`;
      $('#spectators-table tbody').append(str);
    }
  });

  // remove the ugly remaining border when no spectators are there to display
  if (document.querySelectorAll('#spectators-table tbody tr td').length === 0) {
    document
      .querySelectorAll('#spectators-table')[0]
      .classList.add('spectators-table-off');
    document
      .querySelectorAll('#spectators-table')[0]
      .classList.remove('spectators-table-on');

    document
      .querySelectorAll('#spectators-table')[1]
      .classList.add('spectators-table-off');
    document
      .querySelectorAll('#spectators-table')[1]
      .classList.remove('spectators-table-on');
  } else {
    document
      .querySelectorAll('#spectators-table')[0]
      .classList.add('spectators-table-on');
    document
      .querySelectorAll('#spectators-table')[0]
      .classList.remove('spectators-table-off');

    document
      .querySelectorAll('#spectators-table')[1]
      .classList.add('spectators-table-on');
    document
      .querySelectorAll('#spectators-table')[1]
      .classList.remove('spectators-table-off');
  }

  let newUsernameIndex = -1;
  // console.log(oldSpectators);
  // console.log(spectatorUsernames);

  for (let i = 0; i < oldSpectators.length; i++) {
    if (oldSpectators.indexOf(spectatorUsernames[i]) === -1) {
      newUsernameIndex = i;
    }
  }
  if (newUsernameIndex === -1) {
    newUsernameIndex = spectatorUsernames.length - 1;
  }

  // console.log("new player: " + spectatorUsernames[newUsernameIndex]);

  // if an extra person joins the room
  if (
    spectatorUsernames &&
    oldSpectators.length < spectatorUsernames.length &&
    spectatorUsernames[newUsernameIndex] !== ownUsername
  ) {
    if (
      $('#option_notifications_sound_players_joining_room')[0].checked === true
    ) {
      playSound('highDing');
    }

    if (
      $('#option_notifications_desktop_players_joining_room')[0].checked ===
      true &&
      oldSpectators.length < spectatorUsernames.length &&
      spectatorUsernames.indexOf(ownUsername) === -1
    ) {
      displayNotification(
        'New player in room.',
        `${spectatorUsernames[newUsernameIndex]} has joined the room.`,
        'avatars/base-res.png',
        'newPlayerInRoom'
      );
    }
  }
  oldSpectators = spectatorUsernames;

  $('.spectator-count').text(spectatorUsernames.length);
});

socket.on('joinPassword', (roomId) => {
  (async function getEmail() {
    const { value: inputPassword } = await swal({
      title: 'Type in the room password',
      type: 'info',
      input: 'text',
      allowEnterKey: true,
      showCancelButton: true,
      inputAttributes: {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
      },
    });

    if (inputPassword) {
      // swal('Entered password: ' + inputPassword);
      socket.emit('join-room', roomId, inputPassword);
    } else {
      changeView();
    }
  })();
});

socket.on('changeView', (targetLocation) => {
  changeView();
});

socket.on('wrongRoomPassword', () => {
  swal({
    title: 'Incorrect password',
    type: 'warning',
    allowEnterKey: true,
  });
});

socket.on('correctRoomPassword', () => {
  // call roomchat
  setTimeout(() => {
    $('.room-chat-list').html('');
    checkMessageForCommands('/roomchat', 'roomChat');
  }, 500);
});

// this part at the moment only updates the max number of players in a game.
socket.on('update-room-info', (data) => {
  // data.maxNumPlayers
  $(
    '.gameInfoMaxPlayers'
  )[0].innerText = `${roomPlayersData.length}/${data.maxNumPlayers}`;
  // if a game has started
  if (gameData) {
    $('.gameInfoMaxPlayers').addClass('hidden');
  } else {
    $('.gameInfoMaxPlayers').removeClass('hidden');
  }
});

// Update the new room menu with the gameModes available.
socket.on('gameModes', (GAME_MODE_NAMES) => {
  // <option value="avalon">Avalon</option>
  // <option value="hunter">Hunter</option>

  let str = '';

  GAME_MODE_NAMES.forEach((name) => {
    str += `<option value='${name}'>${name[0].toUpperCase()}${name.slice(
      1,
      name.length
    )}</option>`;
  });

  $('.gameModeSelect')[0].innerHTML = str;
  $('.gameModeSelect')[1].innerHTML = str;
});

// Update the role and card settings inside the room (cog).
const defaultActiveRoles = ['Merlin', 'Assassin', 'Percival', 'Morgana'];
const skipRoles = ['Resistance', 'Spy'];

socket.on('update-game-modes-in-room', (gameModeObj) => {
  let str = '';

  let count = 0;

  // Roles
  for (var i = 0; i < gameModeObj.roles.roleNames.length; i++) {
    var name = gameModeObj.roles.roleNames[i];
    // Skip over certain roles since they are enabled by default
    if (skipRoles.includes(name) === true) {
      continue;
    }

    var active;
    if (defaultActiveRoles.includes(name) === true) {
      active = 'active';
    } else {
      active = '';
    }

    str += `<label class='btn btn-mine ${active}'>`;
    str += `<input style='display: none;' name='${name.toLowerCase()}' id='${name.toLowerCase()}' type='checkbox' autocomplete='off' checked> ${name}`;
    str += '</label>';
    str += '<br>';
  }

  // Cards
  for (var i = 0; i < gameModeObj.cards.cardNames.length; i++) {
    var name = gameModeObj.cards.cardNames[i];

    str += "<label class='btn btn-mine'>";
    str += `<input style='display: none;' name='${name.toLowerCase()}' id='${name.toLowerCase()}' type='checkbox' autocomplete='off' checked> ${name}`;
    str += '</label>';
    str += '<br>';
  }
  // Set it in
  $('#rolesCardsButtonGroup')[0].innerHTML = str;

  // Reset, now do descriptions
  // Roles
  str = '';
  infoIconString = `<img class="infoIconsSettings pull-right" style="width: 16px; height: 16px;" data-toggle="tooltip" data-placement="left" title="${icons.info.toolTip}" src="${icons.info.glyph}" />`;

  for (var i = 0; i < gameModeObj.roles.roleNames.length; i++) {
    var name = gameModeObj.roles.roleNames[i];
    // Skip over certain roles since they are enabled by default
    if (skipRoles.includes(name) === true) {
      continue;
    }

    var greenOrRed;
    if (gameModeObj.roles.alliances[i] === 'Resistance') {
      greenOrRed = 'success';
    } else if (gameModeObj.roles.alliances[i] === 'Spy') {
      greenOrRed = 'danger';
    } else {
      greenOrRed = '';
    }

    str += `<div class="panel panel-${greenOrRed} roleCardDescription">
            <div class="panel-heading roleCardDescription" role="tab" id="heading${count}">
            <h4 class="panel-title">
            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#rolesCardsButtonGroupDescription" href="#collapse-cardRole${count}" aria-expanded="false" aria-controls="collapse-cardRole${count}">
                ${gameModeObj.roles.alliances[i]} ${infoIconString}
            </a>
            </h4>
            </div>
            <div id="collapse-cardRole${count}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${count}">
            <div class="panel-body">
                ${gameModeObj.roles.descriptions[i]}
            </div>
            </div>
            </div>`;

    // str += "<span class='roleCardDescription'>";
    // str += gameModeObj.roles.descriptions[i];
    // str += "</span>";

    str += '<br>';
    count += 1;
  }
  // Cards
  for (var i = 0; i < gameModeObj.cards.cardNames.length; i++) {
    var name = gameModeObj.cards.cardNames[i];

    str += `<div class="panel panel-default roleCardDescription">
        <div class="panel-heading roleCardDescription" role="tab" id="heading${count}">
        <h4 class="panel-title">
        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#rolesCardsButtonGroupDescription" href="#collapse-cardRole${count}" aria-expanded="false" aria-controls="collapse-cardRole${count}">
            Card  ${infoIconString}
        </a>
        </h4>
        </div>
        <div id="collapse-cardRole${count}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${count}">
        <div class="panel-body">
            ${gameModeObj.cards.descriptions[i]}
        </div>
        </div>
        </div>`;

    str += '<br>';

    count += 1;
  }
  // Set it in
  $('#rolesCardsButtonGroupDescription')[0].innerHTML = str;
  $('.infoIconsSettings').tooltip();
});

$('.maxNumPlayers').on('change', (e) => {
  // console.log("Change");
  // console.log(e.target.value);

  $($('.maxNumPlayers')[0]).val(e.target.value);
  $($('.maxNumPlayers')[1]).val(e.target.value);

  socket.emit('update-room-max-players', e.target.value);
});

$('.gameModeSelect').on('change', (e) => {
  // console.log("Change");
  // console.log(e.target.value);

  $($('.gameModeSelect')[0]).val(e.target.value);
  $($('.gameModeSelect')[1]).val(e.target.value);

  avalonSelectChecks = document.getElementsByClassName('avalonSelectCheck');
  if (e.target.value === 'avalon') {
    for (let i = 0; i < avalonSelectChecks.length; i++) {
      avalonSelectChecks[i].style.display = 'block';
    }
  } else {
    for (let i = 0; i < avalonSelectChecks.length; i++) {
      avalonSelectChecks[i].style.display = 'none';
      // set both values to unranked when a non-avalon gameMode is chosen
      $($('.rankedSelect')[0]).val('unranked');
      $($('.rankedSelect')[1]).val('unranked');
    }
  }

  socket.emit('update-room-game-mode', e.target.value);
});

$('.rankedSelect').on('change', (e) => {
  $($('.rankedSelect')[0]).val(e.target.value);
  $($('.rankedSelect')[1]).val(e.target.value);

  socket.emit('update-room-ranked', e.target.value);
});

$('.muteSpectators').on('change', (e) => {
  $('.muteSpectators')[0].checked = e.target.checked;
  $('.muteSpectators')[1].checked = e.target.checked;

  socket.emit('update-room-muteSpectators', e.target.checked);
});

$('.disableVoteHistory').on('change', (e) => {
  $('.disableVoteHistory')[0].checked = e.target.checked;
  $('.disableVoteHistory')[1].checked = e.target.checked;

  socket.emit('update-room-disableVoteHistory', e.target.checked);
});

// Update the new room menu with the gameModes available.
socket.on('leave-room-requested', () => {
  leaveRoom();
});

socket.on('redirect', (dest) => {
  window.location.href = dest;
});

socket.on('numPlayersInQueue', (data) => {
  $('#numPlayersInQueue')[0].innerText = data.numPlayersInQueue;
});

socket.on('queueReply', (data) => {
  joined = data.joined;
  $('#queueButton').text(joined ? 'Leave Queue' : 'Join Queue');
})
