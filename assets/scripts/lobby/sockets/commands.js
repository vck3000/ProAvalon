//= =========================================
// COMMANDS
//= =========================================

let commands;
socket.on('commands', (commands_) => {
  commands = commands_;
});

let adminCommands;
socket.on('adminCommands', (commands) => {
  adminCommands = commands;
});

let modCommands;
socket.on('modCommands', (commands) => {
  if (!modCommands) {
    $('#modActionCloseButton').on('click', () => {
      // Send request out.
      var formElement = document.querySelector('#modactionform');
      var bodyFormData = new FormData(formElement);

      const banData = {};
      for (var [key, value] of bodyFormData.entries()) {
        banData[key] = value;
      }

      Swal.fire({
        title: 'Sending your request...',
        onOpen: () => {
          Swal.showLoading();

          axios({
            method: 'POST',
            url: '/mod/ban',
            data: banData,
            config: { headers: { 'Content-Type': 'application/json' } },
          })
            .then(function (response) {
              //handle success
              // console.log(response);

              $('#modModal').modal('hide');

              // Clear the form for next input.
              $('#modactionform')[0].reset();

              Swal.close();
              Swal.fire({
                title: response.data,
                type: 'success',
              });
            })
            .catch(function (err) {
              Swal.close();
              Swal.fire({
                title: err.response.data,
                type: 'error',
              });
            });
        },
      });

      // console.log($("#modactionform").serializeArray());
      // const data = $('#modactionform').serializeArray();

      // socket.emit('modAction', data);
    });
  }
  modCommands = commands;
});

let TOCommands;
socket.on('TOCommands', (commands) => {
  TOCommands = commands;
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
  if (isPlayerMuted(data.username) === true) {
    return;
  }

  let optionEnabled =
    $(`#option_notifications_sound_${data.verb}`)[0].checked === true;
  let interactCooldownOption = $('#option_notifications_buzz_slap_timeout')[0]
    .value;
  let interactOffCooldown =
    !timeLastBuzzSlap ||
    new Date(new Date() - timeLastBuzzSlap).getSeconds() >
      interactCooldownOption;

  if (optionEnabled && interactOffCooldown) {
    playSound(data.verb);

    socket.emit('interactUserPlayed', {
      success: true,
      interactedBy: data.username,
      myUsername: ownUsername,
      verb: data.verb,
      verbPast: data.verbPast,
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
        displayNotification(
          `${username} has buzzed you!`,
          '',
          'avatars/base-spy.png',
          'buzz'
        );
      }
    }

    return;
  }

  socket.emit('interactUserPlayed', {
    success: false,
    interactedBy: data.username,
    myUsername: ownUsername,
    verb: data.verb,
    verbPast: data.verbPast,
  });
});

socket.on('toggleNavBar', (username) => {
  $('.navbar').toggle('hidden');
});
