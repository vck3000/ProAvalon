
function redButtonFunction() {
    // if the button isn't disabled
    if (document.querySelector('#red-button').classList.contains('disabled') === false) {
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
        } else if (gameData.phase === 'voting') {
            // console.log("Voted reject");
            // socket.emit("pickVote", "reject");
            socket.emit('gameMove', { gameMove: 'pickVote', clientData: 'reject' });
        } else if (gameData.phase === 'missionVoting') {
            // console.log("Voted fail");


            if (gameData.alliance === 'Resistance') {
                // console.log("You aren't a spy! You cannot fail a mission!");
                // socket.emit("missionVote", "succeed");
                showDangerAlert('You are resistance. Surely you want to succeed!');
            } else {
                // socket.emit("missionVote", "fail");
                socket.emit('gameMove', { gameMove: 'missionVote', clientData: 'fail' });
            }
        }
        $('#mainRoomBox div').removeClass('highlight-avatar');
    }
}

function greenButtonFunction() {
    // if button isn't disabled:
    if (document.querySelector('#green-button').classList.contains('disabled') === false) {
        if (isSpectator === true) {
            socket.emit('join-game', roomId);
        } else if (gameStarted === false) {
            socket.emit('startGame', getOptions());
        } else if (gameData.phase === 'pickingTeam') {
            const arr = getHighlightedAvatars();
            // console.log(arr);
            socket.emit('gameMove', { gameMove: 'playerPickTeam', clientData: arr });
        } else if (gameData.phase === 'votingTeam') {
            // console.log("Voted approve");
            socket.emit('gameMove', { gameMove: 'pickVote', clientData: 'yes' });

            // socket.emit("pickVote", "approve");
        } else if (gameData.phase === 'votingMission') {
            // console.log("Voted succeed");
            socket.emit('gameMove', { gameMove: 'missionVote', clientData: 'yes' });

            // socket.emit("missionVote", "succeed");
        } else if (gameData.phase === 'assassination') {
            // console.log("Assasinate!!!");
            socket.emit('gameMove', { gameMove: 'assassinate', clientData: getHighlightedAvatars() });


            // socket.emit("assassinate", getHighlightedAvatars());
        } else if (gameData.phase === 'lady') {
            socket.emit('gameMove', { gameMove: 'useLady', clientData: getHighlightedAvatars()[0] });


            // console.log("Lady: " + getHighlightedAvatars()[0]);
            // socket.emit("lady", getHighlightedAvatars()[0]);
        }

        $('#mainRoomBox div').removeClass('highlight-avatar');
    }
}


//= =====================================
// BUTTON EVENT LISTENERS
//= =====================================
document.querySelector('#green-button').addEventListener('click', greenButtonFunction);
document.querySelector('#red-button').addEventListener('click', redButtonFunction);

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


document.querySelector('#danger-alert-box-button').addEventListener('click', () => {
    if (document.querySelector('#danger-alert-box').classList.contains('disconnect')) {

    } else {
        document.querySelector('#danger-alert-box').classList.add('inactive-window');
        document.querySelector('#danger-alert-box-button').classList.add('inactive-window');
    }
});

document.querySelector('#success-alert-box-button').addEventListener('click', () => {
    document.querySelector('#success-alert-box').classList.add('inactive-window');
    document.querySelector('#success-alert-box-button').classList.add('inactive-window');
});

document.querySelector('#backButton').addEventListener('click', () => {
    changeView();
    socket.emit('leave-room', '');

    // console.log("LEAVE");
    resetAllGameData();
});

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
    };

    if (inRoom === false) {
        socket.emit('newRoom', sendObj);

        resetAllGameData();
        inRoom = true;
    }
});
