function redButtonFunction() {
  console.log('red');
  // if the button isn't disabled
  if (
    document.querySelector('#red-button').classList.contains('disabled') ===
    false
  ) {
    if (isSpectator === true) {
    } else if (gameStarted === false) {
      // if we are spectating
      if (document.querySelector('#red-button').innerText === 'Spectate') {
        socket.emit('standUpFromGame');
        // remove claim status when a player sits down
        // then stands up
        socket.emit('setClaim', false);

        enableDisableButtons();
      }
      // we are the host, open kick menu
      else {
        // host kicking
        // Set the kick modal content
        let str = '<h4>Select the players you want to kick.</h4>';

        str += '<div class="btn-group-vertical" data-toggle="buttons">';

        for (let i = 0; i < roomPlayersData.length; i++) {
          if (ownUsername !== roomPlayersData[i].username) {
            str += '<label class="btn btn-mine">';

            str += `<input name="${roomPlayersData[i].username}" id="${roomPlayersData[i].username}" type="checkbox" autocomplete="off">${roomPlayersData[i].username}`;

            str += '</label>';
            str += '<br>';
          } else {
            str += '<label class="btn btn-mine" style="display: none;">';

            str += `<input name="${roomPlayersData[i].username}" id="${roomPlayersData[i].username}" type="checkbox" autocomplete="off">${roomPlayersData[i].username}`;

            str += '</label>';
            str += '<br>';
          }
        }

        str += '</div>';

        $('#kickModalContent')[0].innerHTML = str;
      }
    } else if (
      gameData.phase === 'VotingTeam' ||
      gameData.phase === 'VotingMission'
    ) {
      socket.emit('gameMove', ['no', []]);
    }
    $('#mainRoomBox div').removeClass('highlight-avatar');
  }
}

function greenButtonFunction() {
  // if button isn't disabled:
  if (
    document.querySelector('#green-button').classList.contains('disabled') ===
    false
  ) {
    if (isSpectator === true) {
      socket.emit('join-game', roomId);
    } else if (gameStarted === false) {
      const startGameData = {
        options: getOptions(),
        gameMode: $($('.gameModeSelect')[1]).val(),
        timeouts: {
          default: ((parseInt($('#startGameOptionsDefaultPhaseTimeoutMin').val()) * 60 + parseInt($('#startGameOptionsDefaultPhaseTimeoutSec').val())) * 1000).toString(),
          assassination: ((parseInt($('#startGameOptionsAssassinationPhaseTimeoutMin').val()) * 60 + parseInt($('#startGameOptionsAssassinationPhaseTimeoutSec').val())) * 1000).toString()
        },
        anonymousMode: $('#startGameOptionsAnonymousMode')[0].checked,
      };

      socket.emit('startGame', startGameData);
    } else if (
      gameData.phase === 'VotingTeam' ||
      gameData.phase === 'VotingMission'
    ) {
      socket.emit('gameMove', ['yes', []]);
    } else {
      socket.emit('gameMove', ['yes', getHighlightedAvatars()]);
    }

    $('#mainRoomBox div').removeClass('highlight-avatar');
  }
}

//= =====================================
// BUTTON EVENT LISTENERS
//= =====================================
document
  .querySelector('#green-button')
  .addEventListener('click', greenButtonFunction);
document
  .querySelector('#red-button')
  .addEventListener('click', redButtonFunction);

// re-draw the game screen when the modal is closed to update the roles in the center well.
$('#roleOptionsModal').on('hidden.bs.modal', (e) => {
  draw();
  // console.log("test");
});

// Set the event listener for the button
$('#kickButton')[0].addEventListener('click', () => {
  const players = getKickPlayers();

  // kick the selected players one by one
  for (const key in players) {
    if (players.hasOwnProperty(key)) {
      socket.emit('kickPlayer', key);
      // console.log("kick player: " + key);
    }
  }
});

document
  .querySelector('#danger-alert-box-button')
  .addEventListener('click', () => {
    if (
      document
        .querySelector('#danger-alert-box')
        .classList.contains('disconnect')
    ) {
    } else {
      document
        .querySelector('#danger-alert-box')
        .classList.add('inactive-window');
      document
        .querySelector('#danger-alert-box-button')
        .classList.add('inactive-window');
    }
  });

document
  .querySelector('#success-alert-box-button')
  .addEventListener('click', () => {
    document
      .querySelector('#success-alert-box')
      .classList.add('inactive-window');
    document
      .querySelector('#success-alert-box-button')
      .classList.add('inactive-window');
  });

document.querySelector('#backButton').addEventListener('click', () => {
  leaveRoom();
});

function leaveRoom() {
  changeView();
  socket.emit('leave-room', '');

  // console.log("LEAVE");
  resetAllGameData();
}

function joinRoom(roomId_) {
  socket.emit('join-room', roomId_);
  // change the view to the room instead of lobby
  roomId = roomId_;
  // set the spectator to true
  isSpectator = true;
  // change to the game room view
  changeView();
}

document.querySelector('#claimButton').addEventListener('click', () => {
  // INCOMPLETE
  // disallow innertext change to "unclaim" when spectators
  // click a disabled claim button
  if (isSpectator === false) {
    const btnText = $('#claimButton').text();
    if (btnText === 'Claim') {
      socket.emit('setClaim', true);
    } else {
      socket.emit('setClaim', false);
    }
  }
});

// New room code (When its opened, open the modal and reset to default settings)
$('#newRoom').on('click', (data) => {
  $('#newRoomModal').modal('show');
  // password empty default
  $('#newRoomPassword').val('');
  // 10p default
  $('.maxNumPlayers').val('10');

  // $(".gun").css("visibility", "hidden");

  $('.gun').removeClass('gunAfter');
  $('.gun').addClass('gunBefore');
});

$('#createNewRoomButton').on('click', (data) => {
  // console.log( $($(".maxNumPlayers")[1]).val() );
  // console.log( $("#newRoomPassword").val() );

  const sendObj = {
    maxNumPlayers: $($('.maxNumPlayers')[1]).val(),
    newRoomPassword: $('#newRoomPassword').val(),
    gameMode: $($('.gameModeSelect')[1]).val(),
    muteSpectators: $('.muteSpectators')[1].checked,
    disableVoteHistory: $('.disableVoteHistory')[1].checked,
    ranked: $($('.rankedSelect')[1]).val(),
  };

  // Update the settings in the in room settings menu.
  $($('.maxNumPlayers')[0]).val(sendObj.maxNumPlayers);
  $($('.gameModeSelect')[0]).val(sendObj.gameMode);
  $('.muteSpectators')[0].checked = sendObj.muteSpectators;
  $('.disableVoteHistory')[0].checked = sendObj.disableVoteHistory;
  $($('.rankedSelect')[0]).val(sendObj.ranked);

  if (inRoom === false) {
    socket.emit('newRoom', sendObj);

    resetAllGameData();
    inRoom = true;
  }
});

let joined = false;

$('#queueButton').on('click', () => {
  socket.emit('queue-request', { join : !joined });
});
