//= =========================================
// COMMANDS
//= =========================================
socket.on('commands', (commands) => {
    assignCommands(commands);
});

let modCommands;
socket.on('modCommands', (commands) => {
    if (!modCommands) {
        $('#modActionCloseButton').on('click', () => {
            // Send request out.
            var formElement = document.querySelector("#modactionform");
            var bodyFormData = new FormData(formElement);

            console.log(bodyFormData);
            for (var [key, value] of bodyFormData.entries()) { 
                console.log(key, value);
              }
            
            Swal.fire({
                title: 'Sending your request...',
                onOpen: () => {
                    Swal.showLoading();

                    axios({
                        method: 'POST',
                        url: '/mod/ban',
                        data: bodyFormData,
                        
                        config: { headers: {'Content-Type': 'multipart/form-data'} }
                        })
                        .then(function (response) {
                            //handle success
                            // console.log(response);

                            $('#modModal').modal('hide');

                            // Clear the form for next input.
                            $("#modactionform")[0].reset();

                            Swal.close()
                            Swal.fire({
                                title: response.data,
                                type: 'success'
                            });
                        })
                        .catch(function (err) {
                            Swal.close()
                            Swal.fire({
                                title: err.response.data,
                                type: 'error'
                            });
                        });
                }
            });       


            // console.log($("#modactionform").serializeArray());
            // const data = $('#modactionform').serializeArray();

            // socket.emit('modAction', data);
        });
    }
    modCommands = commands;
});

let adminCommands;
socket.on('adminCommands', (commands) => {
    adminCommands = commands;
});


socket.on('messageCommandReturnStr', (dataInc) => {
    if (dataInc) {
        // console.log(dataInc);

        if (!dataInc.dateCreated) {
            dataInc.dateCreated = new Date();
        }

        if (lastChatBoxCommand === 'allChat') {
            addToAllChat(dataInc);
        } else if (lastChatBoxCommand === 'roomChat') {
            addToRoomChat(dataInc);
        } else {
            addToAllChat(dataInc);
        }
        // console.log("received return str");
    }
});

let timeLastBuzzSlap;
// the following two objects are only for special cases where they are not the default value
const interactUserMessageTimeOffset = {
    // default value is 0
    slap: 1100,
};

socket.on('interactUser', (data) => {
    if (isPlayerMuted(data.username) === true) { return; }

    let optionEnabled = $(`#option_notifications_sound_${data.verb}`)[0].checked === true;
    let interactCooldownOption = $('#option_notifications_buzz_slap_timeout')[0].value;
    let interactOffCooldown = !timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > interactCooldownOption;

    if (optionEnabled && interactOffCooldown) {
        playSound(data.verb);

        socket.emit('interactUserPlayed', {
            success: true, interactedBy: data.username, myUsername: ownUsername, verb: data.verb, verbPast: data.verbPast,
        });

        timeLastBuzzSlap = new Date();

        const dataString = {
            message: `You have been ${data.verbPast} by ${data.username}.`,
            classStr: 'server-text',
            dateCreated: new Date(),
        };

        let timeDelay = interactUserMessageTimeOffset[data.verb] || 0;

        setTimeout(() => {
            // if (lastChatBoxCommand === "allChat") {
            //     addToAllChat(dataString);
            // }
            // else if (lastChatBoxCommand === "roomChat") {
            //     addToRoomChat(dataString);
            // }else{
            addToAllChat(dataString);
            addToRoomChat(dataString);
            // }
        }, timeDelay);

        // only display notif if its a buzz
        if (data.verb === 'buzz') {
            if ($('#option_notifications_desktop_buzz')[0].checked === true) {
                displayNotification(`${username} has buzzed you!`, '', 'avatars/base-spy.png', 'buzz');
            }
        }

        return;
    }

    socket.emit('interactUserPlayed', {
        success: false, interactedBy: data.username, myUsername: ownUsername, verb: data.verb, verbPast: data.verbPast,
    });
});


// socket.on("slap", function (username) {
//     var interacted = false;

//     if(isPlayerMuted(username) === false){
//         if($("#option_notifications_sound_slap")[0].checked === true){
//             if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
//                 playSound("slap");

//                 socket.emit("interactUserPlayed", {success: true, interactedBy: username, myUsername: ownUsername});
//                 interacted = true;

//                 timeLastBuzzSlap = new Date();

//                 var data = {
//                     message: "You have been slapped by " + username + ".",
//                     classStr: "server-text",
//                     dateCreated: new Date()
//                 }
//                 setTimeout(function () {
//                     if (lastChatBoxCommand === "allChat") {
//                         addToAllChat(data);
//                     }
//                     else if (lastChatBoxCommand === "roomChat") {
//                         addToRoomChat(data);
//                     }
//                 }, 1100);
//             }
//         }
//     }
//     if(interacted === false){
//         socket.emit("interactUserPlayed", false);
//     }
// });

// socket.on("buzz", function (username) {
//     if(isPlayerMuted(username) === false){
//         if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
//             if($("#option_notifications_sound_buzz")[0].checked === true){
//                 playSound("ding");

//                 var data = {
//                     message: "You have been buzzed by " + username + ".",
//                     classStr: "server-text",
//                     dateCreated: new Date()
//                 }
//                 setTimeout(function () {
//                     if (lastChatBoxCommand === "allChat") {
//                         addToAllChat(data);
//                     }
//                     else if (lastChatBoxCommand === "roomChat") {
//                         addToRoomChat(data);
//                     }
//                 }, 0);
//             }

//             if($("#option_notifications_desktop_buzz")[0].checked === true){
//                 displayNotification(username + " has buzzed you!", "", "avatars/base-spy.png", "buzz");
//             }
//         }
//     }

// });

// socket.on("lick", function (username) {
//     if(isPlayerMuted(username) === false){
//         if(!timeLastBuzzSlap || new Date(new Date() - timeLastBuzzSlap).getSeconds() > $("#option_notifications_buzz_slap_timeout")[0].value){
//             if($("#option_notifications_sound_buzz")[0].checked === true){
//                 playSound("lick");

//                 var data = {
//                     message: "You have been licked by " + username + ".",
//                     classStr: "server-text",
//                     dateCreated: new Date()
//                 }
//                 setTimeout(function () {
//                     if (lastChatBoxCommand === "allChat") {
//                         addToAllChat(data);
//                     }
//                     else if (lastChatBoxCommand === "roomChat") {
//                         addToRoomChat(data);
//                     }
//                 }, 0);
//             }
//         }
//     }
// });

socket.on('toggleNavBar', (username) => {
    $('.navbar').toggle('hidden');
});
