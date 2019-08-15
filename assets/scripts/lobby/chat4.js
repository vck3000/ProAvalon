const allChatWindow1 = document.querySelectorAll('.all-chat-message-input')[0];
allChatWindow1.onkeydown = function (e, allChatWindow1) {
    // When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

const allChatWindow2 = document.querySelectorAll('.all-chat-message-input')[1];
allChatWindow2.onkeydown = function (e, allChatWindow2) {
    // When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

const allChatWindow3 = document.querySelectorAll('.all-chat-message-input')[2];
allChatWindow3.onkeydown = function (e, allChatWindow3) {
    // When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};


function addAllChatEventListeners(e, allChatWindow) {
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

    if (e.keyCode == 13) {
        const d = new Date();
        // set up the data structure:
        const message = allChatWindow.value;

        // only do it if the user has inputted something
        // i.e. dont run when its an empty string
        if (message && message.length > 0) {
            // append 0 in front of single digit minutes

            const date = d.getMinutes();

            // if(date < 10){date = "0" + date;}

            const data = {
                date,
                message,
            };

            // reset the value of the textbox
            allChatWindow.value = '';

            // check message, if false then no command.
            if (checkMessageForCommands(message, 'allChat') === true) {
                // do nothing, all will be done in function checkMessageForCommands.
            } else {
                // send data to the server
                socket.emit('allChatFromClient', data);
            }
            scrollDown('all-chat-lobby');
            scrollDown('all-chat-room');
            scrollDown('all-chat-room2');
        }
    }
}

const roomChatWindow1 = document.querySelectorAll('.room-chat-message-input')[0];

roomChatWindow1.onkeydown = function (e, roomChatWindow1) {
    // When enter is pressed in the chatmessageinput
    addRoomChatEventListeners(e, this);
};

const roomChatWindow2 = document.querySelectorAll('.room-chat-message-input')[1];
roomChatWindow2.onkeydown = function (e, roomChatWindow2) {
    // When enter is pressed in the chatmessageinput
    addRoomChatEventListeners(e, this);
};

function addRoomChatEventListeners(e, roomChatWindow) {
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

    if (e.keyCode == 13) {
        const d = new Date();
        // set up the data structure:
        const message = roomChatWindow.value;

        // only do it if the user has inputted something
        // i.e. dont run when its an empty string
        if (message && message.length > 0) {
            // append 0 in front of single digit minutes

            const date = d.getMinutes();
            // if(date < 10){date = "0" + date;}

            const data = {
                date,
                message,
            };

            // reset the value of the textbox
            roomChatWindow.value = '';

            // check message, if false then no command.
            if (checkMessageForCommands(message, 'roomChat') === true) {
                // do nothing, all will be done in function checkMessageForCommands.
            } else {
                // send data to the server
                socket.emit('roomChatFromClient', data);
            }
            scrollDown('room-chat-room');
            scrollDown('room-chat-room2');
        }
    }
}


function addToAllChat(data) {
    // console.log("raw data");
    // console.log(data);

    if (data) {
        // if it is not an array, force it into a array
        if (data[0] === undefined) {
            //   console.log("force array");
            data = [data];
        }

        // console.log("add to all chat: ");
        // console.log(data);

        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i].message) {
                // set up the date:
                var date;
                var d;
                if (data[i].dateCreated) {
                    d = new Date(data[i].dateCreated);
                } else {
                    d = new Date();
                }
                let hour = d.getHours();
                let min = d.getMinutes();
                if (hour < 10) { hour = `0${hour}`; }
                if (min < 10) { min = `0${min}`; }
                date = `[${hour}:${min}]`;

                // if(!data[i].dateCreated){
                //     date = "[" + "]";
                // }


                let filteredMessage = data[i].message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&nbsp;/, '&amp;nbsp;');

                filteredMessage = linkifyHtml(filteredMessage, {
                    validate: {
                        url(value) {
                            return /^(http|ftp)s?:\/\/|www/.test(value);
                        },
                    },
                });

                let str = '';
                if (data[i].classStr && data[i].classStr !== '') {
                    str = `<li class='${data[i].classStr}'><span class='date-text'>${date}</span> ${filteredMessage}`;
                } else {
                    str = `${"<li class='" + "'><span class='date-text'>"}${date}</span> <span class='username-text'>${data[i].username}:</span> ${filteredMessage}`;
                }

                // if they've muted this player, then just dont show anything. reset str to nothing.
                if (isPlayerMuted(data[i].username) === true) {
                    str = '';
                }

                $('.all-chat-list').append(str);
                scrollDown('all-chat-lobby');
                scrollDown('all-chat-room');
                scrollDown('all-chat-room2');


                // yellow notification on the tabs in room.
                if ($('.nav-tabs #all-chat-in-game-tab').hasClass('active') === false) {
                    $('.nav-tabs #all-chat-in-game-tab')[0].classList.add('newMessage');
                }

                if (!roomPlayersData) {
                    // console.log("REMOVED");
                    $('.nav-tabs #all-chat-in-game-tab')[0].classList.remove('newMessage');
                }
            }
        }
    }
}


function unhighlightAllChat() {
    const usernames = Object.keys(selectedChat);

    usernames.forEach((user) => {
        selectedChat[user] = false;
        const chatItems = $(`.room-chat-list li span[username='${user}']`);
        chatItems.css('background-color', 'transparent');
        chatItems.css('color', '');
    });
}

const roomChatHistory = [];

function addToRoomChat(data) {
    // if it is not an array, force it into a array
    if (data) {
        if (data[0] === undefined) {
            data = [data];
        }

        const usernamesOfPlayersInGame = [];
        if (gameStarted === true) {
            roomPlayersData.forEach((obj) => {
                usernamesOfPlayersInGame.push(obj.username);
            });
        }

        for (let i = 0; i < data.length; i++) {
            // format the date
            // var d = new Date();
            // var hour = d.getHours();
            // var min = d.getMinutes();
            // if (hour < 10) { hour = "0" + hour; }
            // if (min < 10) { min = "0" + min; }
            // var date = "[" + hour + ":" + min + "]";


            if (data[i] && data[i].message.trim()) {
                // set up the date:
                var date;

                // console.log(data[i].dateCreated);
                var d;
                if (data[i].dateCreated) {
                    d = new Date(data[i].dateCreated);
                } else {
                    d = new Date();
                }
                let hour = d.getHours();
                let min = d.getMinutes();
                if (hour < 10) { hour = `0${hour}`; }
                if (min < 10) { min = `0${min}`; }
                date = `[${hour}:${min}]`;
                data[i].dateStr = date;

                // if(!data[i].dateCreated){
                //     date = "[" + "]";
                // }


                let addClass = '';
                const muteSpectators = $('.muteSpecs')[0].checked;
                // if they dont exist in players in room, if game is started, and if mute spectators
                let thisMessageSpectator = false;

                // oldSpectators is the var stored in sockets file that
                // has a list of usernames of spectators
                if (oldSpectators.indexOf(data[i].username) !== -1 && gameStarted === true && muteSpectators === true) {
                    // this message is muted.
                    // dont do anything
                    addClass = 'hidden-spectator-chat spectator-chat';
                    thisMessageSpectator = true;
                } else if (oldSpectators.indexOf(data[i].username) !== -1 && gameStarted === true) {
                    addClass = 'spectator-chat';
                    thisMessageSpectator = true;
                }

                const muteJoinLeave = $('.mutejoinleave')[0].checked;
                // if they dont exist in players in room, if game is started, and if mute spectators
                let thisMessageJoinLeave = false;
                // console.log(data[i].classStr);
                // console.log(muteJoinLeave);

                if (data[i].classStr === 'server-text-teal' && muteJoinLeave === true) {
                    thisMessageJoinLeave = true;
                    addClass += ' hidden-spectator-chat';
                }


                // prevent XSS injection
                let filteredMessage = data[i].message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&nbsp;/, '&amp;nbsp;');
                // console.log("Filtered message: " + filteredMessage);

                filteredMessage = linkifyHtml(filteredMessage, {
                    validate: {
                        url(value) {
                            return /^(http|ftp)s?:\/\/|www/.test(value);
                        },
                    },
                });

                let str = '';


                // any part of the chat before any quoted parts
                let unquotedMessage = filteredMessage.split('[')[0];

                const rawQuotedString = filteredMessage.slice(unquotedMessage.length);
                // unquotedMessage = unquotedMessage.trim();

                const quotedStrings = [];
                const quotesList = rawQuotedString.split('[').slice(1);

                var s = '';
                while (quotesList.length > 0) {
                    const lastQuote = `[${quotesList.pop()}`;
                    s = lastQuote + s;
                    // console.log('s = ' + s);

                    // parse "[hh:mm]", "username" and everything after the ": "
                    var dateStr = s.slice(0, 7);
                    var username = s.slice(8, s.indexOf(': '));
                    var text = s.slice(s.indexOf(': ') + 2);
                    // console.log('dateStr = ' + dateStr);
                    // console.log('username = ' + username);
                    // console.log('text = ' + text);

                    // verify all quotes are either a server message or have actually been said
                    if (roomChatHistory.filter((d) => (d.classStr !== null
                        && s.slice(8).trim() === d.message.trim())
                        || (username === d.username // or was said by that user. only check the one's place of the minutes
                            && dateStr[3] === ':' // (to ignore timezones, which can be off by hours or even half-hours)
                            && dateStr[5] === d.dateStr[5]
                            && d.message.startsWith(text.trim()))).length > 0) {
                        quotedStrings.push(s);
                        console.log(`pushed ${s}`);
                        s = '';
                    }
                }

                // if 's' is still not a verified quote, add it as normal text
                unquotedMessage += s;
                quotedStrings.reverse(); // was built backwards
                // console.log("quoted stuff: " + quotedStrings.join(','));
                data[i].message = unquotedMessage.trim();


                // Handle the non-quoted parts
                // set the highlight chat if the user has been selected already
                let highlightChatColour = '';
                const setHighlightColorToYellow = $('.setHighlightColorsToYellow')[0].checked;
                let highlightForegroundColorHtml = ';';

                // console.log("true?"  + selectedChat[data[i].username]);
                let usernameOnly = data[i].username;
                if (data[i].username) {
                    usernameOnly = data[i].username.split(' ')[0];
                }

                if (selectedChat[usernameOnly] === true && getIndexFromUsername(usernameOnly) !== undefined) {
                    if (setHighlightColorToYellow === true) {
                        highlightChatColour = '#ffff9e';
                    } else {
                        highlightChatColour = docCookies.getItem(`player${getIndexFromUsername(usernameOnly)}HighlightColour`);
                    }
                    highlightForegroundColorHtml = 'color: #333;';
                }

                // if its a server text or special text
                if (data[i].classStr && data[i].classStr !== '') {
                    str = `<li class='${data[i].classStr} ${addClass}'><span class='date-text'>${date}</span> ${unquotedMessage}`;
                }
                // its a user's chat so put some other stuff on it
                else {
                    str = `<li class='${addClass}'><span style='${highlightForegroundColorHtml}background-color: ${highlightChatColour
                    }' username='${usernameOnly}'><span class='date-text'> ${date}</span> <span class='username-text'>${
                        data[i].username}:</span> ${unquotedMessage.trim() || '<i>Quoting:</i>'}</span></li>`;
                }

                // if they've muted this player, then just dont show anything. reset str to nothing.
                if (isPlayerMuted(data[i].username) === true) {
                    str = '';
                }

                $('.room-chat-list').append(str);
                scrollDown('room-chat-room');
                scrollDown('room-chat-room2');


                // Handle the quoted parts
                if (quotedStrings.length > 0) {
                    let strQuotes = '';
                    // DEPRECATED: No longer need this, since it's being done above in the unquoted part
                    // if (unquotedMessage.length === 0)
                    //    strQuotes = "<li class='" + addClass + "'><span username='" + data[i].username + "'><span class='date-text'>" + date + "</span> <span class='username-text'>" + data[i].username + ":</span> Quoting:</span></li>";
                    // else
                    //    "<li class='" + addClass + "'>Quoting:</li>";
                    // console.log("Strings: ");

                    let goFor = quotedStrings.length;
                    // only 5 lines of quote at a time max.
                    if (goFor > 6) {
                        goFor = 6;
                    }

                    for (let j = 0; j < goFor; j++) {
                        strQuotes += `<li class='myQuote ${addClass}'>${quotedStrings[j]}</li>`;
                        // console.log(strings[j]);
                    }

                    // if they've muted this player, then just dont show anything. reset str to nothing.
                    if (isPlayerMuted(data[i].username) === true) {
                        strQuotes = '';
                    }

                    $('.room-chat-list').append(strQuotes);
                    scrollDown('room-chat-room');
                    scrollDown('room-chat-room2');
                }

                if (thisMessageSpectator === true && muteSpectators === true) {
                    // if the person talking is a spectator, and if mute spectators is checked,
                    // then dont show yellow notification. Otherwise show.
                } else if (thisMessageJoinLeave === true && muteJoinLeave === true) {
                    // It is a message that is joining or leaving
                } else {
                    // yellow notification on the tabs in room.
                    if ($('.nav-tabs #room-chat-in-game-tab').hasClass('active') === false) {
                        $('.nav-tabs #room-chat-in-game-tab')[0].classList.add('newMessage');
                    }
                }
                roomChatHistory.push(data[i]);
            }
        }
    }
}

function isPlayerMuted(username) {
    if (mutedPlayers.indexOf(username) !== -1) {
        return true;
    }

    return false;
}

// Remove the new message yellow background colour when
// user selects the tab
$('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    const target = $(e.target).attr('href'); // activated tab
    // console.log(target);

    if (target === '#all-chat-in-game' || target === '#all-chat-in-game2') {
        $('.nav-tabs #all-chat-in-game-tab').removeClass('newMessage');
    } else if (target === '#room-chat-in-game' || target === '#room-chat-in-game2') {
        $('.nav-tabs #room-chat-in-game-tab').removeClass('newMessage');
    }

    console.log(`change tab ${target}`);

    if ($(target).find('.chat-window')[0]) {
        scrollDown($(target).find('.chat-window')[0].id, true);
    }
});

// When the player presses the mmute specs button
$('.muteSpecs').on('change', (e) => {
    // console.log(e);
    // console.log(e.target.checked);

    const muteButtons = $('.muteSpecs');

    for (let i = 0; i < muteButtons.length; i++) {
        muteButtons[i].checked = e.target.checked;
    }

    if (e.target.checked === true) {
        $('.spectator-chat').addClass('hidden-spectator-chat');
    } else {
        $('.spectator-chat').removeClass('hidden-spectator-chat');
    }

    scrollDown('room-chat-room', true);
    scrollDown('room-chat-room2', true);
});


// When the player presses the mmute specs button
$('.mutejoinleave').on('change', (e) => {
    // console.log(e);
    // console.log(e.target.checked);

    const muteButtons = $('.mutejoinleave');

    for (let i = 0; i < muteButtons.length; i++) {
        muteButtons[i].checked = e.target.checked;
    }

    // Note! Careful here, we only use this server-text-teal class for
    // player joining and leaving so thats why it works
    // if in the future we add more teal server text it will hide those too!
    if (e.target.checked === true) {
        $('.server-text-teal').addClass('hidden-spectator-chat');
    } else {
        $('.server-text-teal').removeClass('hidden-spectator-chat');
    }

    scrollDown('room-chat-room', true);
    scrollDown('room-chat-room2', true);
});


// When the player sets the color to yellow
$('.setHighlightColorsToYellow').on('change', (e) => {
    const checkBoxes = $('.setHighlightColorsToYellow');

    for (let i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].checked = e.target.checked;
    }

    const usernames = Object.keys(selectedChat);

    if (e.target.checked === true) {
        const color = '#ffff9e';
        usernames.forEach((user) => {
            if (selectedChat[user] === true) {
                const chatItems = $(`.room-chat-list li span[username='${user}']`);
                chatItems.css('background-color', color);
            }
        });
    } else {
        usernames.forEach((user) => {
            if (selectedChat[user] === true) {
                const chatItems = $(`.room-chat-list li span[username='${user}']`);
                const color = docCookies.getItem(`player${getIndexFromUsername(user)}HighlightColour`);
                chatItems.css('background-color', color);
            }
        });
    }
});
