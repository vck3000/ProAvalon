
//= =====================================
// GAME SOCKET ROUTES
//= =====================================
socket.on('game-starting', (roles, gameMode) => {
    const secondsLeft = 10;
    let timerInterval;

    let gameModeCap;
    if (gameMode) {
        gameModeCap = gameMode[0].toUpperCase() + gameMode.slice(1, gameMode.length);
    } else {
        gameModeCap = '';
    }

    Swal({
        title: `${gameModeCap} game is starting!`,
        html: `<strong></strong> seconds left. <br><br>Roles are: ${roles}`,
        type: 'info',
        confirmButtonText: 'Ready',
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: 'Not ready',
        allowOutsideClick: false,
        allowEnterKey: false,
        reverseButtons: true,

        timer: 11000,

        onOpen: () => {
            // swal.showLoading()
            timerInterval = setInterval(() => {
                swal.getContent().querySelector('strong')
                    .textContent = Math.floor(swal.getTimerLeft() / 1000);
            }, 100);
        },
        onClose: () => {
            clearInterval(timerInterval);
        },

    }).then((result) => {
        // console.log(result)
        if (result.dismiss === swal.DismissReason.timer || result.dismiss === swal.DismissReason.cancel) {
            // console.log('I was closed by the timer')
            socket.emit('player-not-ready', ownUsername);
        } else {
            // console.log('Im ready!')
            socket.emit('player-ready', ownUsername);
        }
    });

    if ($('#option_notifications_sound_game_starting')[0].checked === true) {
        playSound('game-start-ready');
    }

    if ($('#option_notifications_desktop_game_starting')[0].checked === true) {
        displayNotification('Game starting!', 'Are you ready?', 'avatars/base-spy.png', 'gameStarting');
    }
});

socket.on('spec-game-starting', (data) => {
    Swal({
        title: 'A game is starting!',
        text: 'You cannot join the game unless someone is not ready.',
        type: 'info',
        allowEnterKey: false,
        timer: 11000,
    });

    // document.querySelector("#green-button").classList.contains("hidden")

    $('#green-button').addClass('hidden');
});

socket.on('spec-game-starting-finished', (data) => {
    $('#green-button').removeClass('hidden');
});


socket.on('game-data', (data) => {
    // console.log("GAME DATA INC");
    // console.log(data);
    if (data && roomId === data.roomId) {
        // console.log("game starting!");

        // console.log(data);
        gameData = data;

        // if the game has only just started for the first time, display your role
        if (gameStarted === false) {
            if (gameData.alliance) {
                const str = `You are a ${gameData.alliance}. Your role is ${gameData.role}.`;
                data = {
                    classStr: 'server-text noselect',
                    message: str,
                    dateCreated: new Date(),
                };
                addToRoomChat(data);
            }

            if ($('#option_notifications_sound_game_starting')[0].checked === true) {
                // playSound("game-start");
            }
        }

        gameStarted = true;

        // hide the options cog
        document.querySelector('#options-button').classList.add('hidden');
        // remove the kick modal from redbutton
        $('#red-button').removeAttr('data-target');
        $('#red-button').removeAttr('data-toggle');

        isSpectator = gameData.spectator;

        drawVoteHistory(gameData);
        draw();
    }
});

socket.on('lady-info', (message) => {
    const str = `${message} (this message is only shown to you)`;
    const data = { message: str, classStr: 'special-text noselect' };

    addToRoomChat(data);
});


hoverMissionBoxHighlightPlayerSetup();
hoverPickBoxHighlightPlayerSetup();

function hoverMissionBoxHighlightPlayerSetup() {
    $('.missionBox').hover(
        // Upon hover:
        function () {
            // console.log(this);
            // console.log(this.getAttribute("id"));
            // console.log(this.getAttribute("id").slice(-1));

            const missionNum = this.getAttribute('id').slice(-1);
            // Return if the mission hasn't completed yet
            if (missionNum >= gameData.missionHistory.length) {
                return;
            }
            // Grab players to highlight
            const participatingTeamAndLeader = getPlayersOnMissionPickAndLeader(parseInt(missionNum));

            highlightTeamAndOutlineLeader(participatingTeamAndLeader);

            const darkThemeBool = docCookies.getItem('optionDisplayDarkTheme') === true;
            // Only edit the css if we have something to show
            if (participatingTeamAndLeader.team.length !== 0) {
                // For the missionBox itself
                if (darkThemeBool) {
                    $(this).css('outline', '5px solid rgba(255, 255, 0, 0.65)');
                } else {
                    $(this).css('outline', '5px solid rgba(255, 255, 0, 1)');
                }
            }
        },
        // Upon unhover:
        removeTeamHighlightAndLeaderOutline,
    );
}

function hoverPickBoxHighlightPlayerSetup() {
    $('.pickBox').hover(
        // on hover
        function () {
            const pickNum = this.getAttribute('id').slice(-1);
            const participatingTeamAndLeader = getPlayersOnMissionPickAndLeader(gameData.missionNum - 1, parseInt(pickNum));

            highlightTeamAndOutlineLeader(participatingTeamAndLeader);

            const darkThemeBool = docCookies.getItem('optionDisplayDarkTheme') === true;
            // Only edit the css if we have something to show
            if (participatingTeamAndLeader.team.length !== 0) {
                // Since pickBoxes are small, we'll just fill them with yellow.
                if (darkThemeBool) {
                    $(this).addClass('highlight-pick-dark');
                } else {
                    $(this).addClass('highlight-pick');
                }
            }
        },
        // on unhover
        removeTeamHighlightAndLeaderOutline,
    );
}

// Takes an object of type:
// {
//    team: [string],
//    leader: string
// }
// and highlights the team members, and outlines the leader
function highlightTeamAndOutlineLeader(teamAndLeader) {
    const darkThemeBool = docCookies.getItem('optionDisplayDarkTheme') === true;

    teamAndLeader.team.forEach((username) => {
        if (darkThemeBool) {
            $(`[usernameofplayer="${username}"]`).addClass('highlight-participating-dark');
        } else {
            $(`[usernameofplayer="${username}"]`).addClass('highlight-participating');
        }
    });

    const { leader } = teamAndLeader;
    if (leader.length > 0) {
        $(`[usernameofplayer="${leader}"]`).addClass('outline-leader');
    }
}

function removeTeamHighlightAndLeaderOutline() {
    // Reset all the displays for this function
    $('.playerDiv').removeClass('highlight-participating');
    $('.playerDiv').removeClass('highlight-participating-dark');
    $('.pickBox').removeClass('highlight-pick');
    $('.pickBox').removeClass('highlight-pick-dark');
    $('.playerDiv').removeClass('outline-leader');
    $('.playerDiv').css('opacity', '');

    $(this).css('outline', '');
    $(this).css('opacity', '');
}

// Given a mission number and the pick number, returns the people on that mission pick
// If pickNum is -1, then returns the people on the last pick of that mission
function getPlayersOnMissionPickAndLeader(missionNum, pickNum = -1) {
    // We need a player key to see vote history to get the number of picks in the mission
    const firstPlayerKey = Object.keys(gameData.voteHistory)[0];

    // The first case prevents us from erroring when we hover over the first pick of a mission before the arrays update
    // The second case prevents us from prematurely highlighting missions that aren't complete.
    if (missionNum >= gameData.voteHistory[firstPlayerKey].length) {
        return {
            team: [],
            leader: [],
        };
    }
    const numPicksInMission = gameData.voteHistory[firstPlayerKey][missionNum].length;
    if (pickNum >= numPicksInMission) {
        return {
            team: [],
            leader: [],
        };
    }
    const team = [];
    let leader = '';
    // For each player:
    for (const key in gameData.voteHistory) {
        if (gameData.voteHistory.hasOwnProperty(key) === true) {
            // console.log(key);
            if (pickNum == -1) {
                // Get the length of the mission (how many picks in the mission because we grab the last pick)
                pickNum = gameData.voteHistory[key][missionNum].length - 1;
            }
            // console.log("a: " + missionLen);

            // If the user was picked, add to the list
            if (gameData.voteHistory[key][missionNum][pickNum].includes('VHpicked') === true) {
                team.push(key);
            }
            if (gameData.voteHistory[key][missionNum][pickNum].includes('VHleader')) {
                leader = key;
            }
        }
    }

    return {
        team,
        leader,
    };
}
