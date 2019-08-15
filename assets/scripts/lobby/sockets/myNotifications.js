//= =====================================
// NOTIFICATIONS
//= =====================================
socket.on('alert', (data) => {
    alert(data);
    window.location.replace('/');
});

socket.on('success-alert', (data) => {
    showSuccessAlert(data);
});

socket.on('danger-alert', (data) => {
    showDangerAlert(data);
});

function showSuccessAlert(data) {
    document.querySelector('#success-alert-box').classList.remove('inactive-window');
    document.querySelector('#success-alert-box-button').classList.remove('inactive-window');
    document.querySelector('#success-alert-box').innerHTML = `${data} <span class='glyphicon glyphicon-remove pull-right'></span>`;
}


function showDangerAlert(data) {
    if (data === 'You have been disconnected! Please refresh the page.') {
        document.querySelector('#danger-alert-box').classList.add('disconnect');
    }

    document.querySelector('#danger-alert-box').classList.remove('inactive-window');
    document.querySelector('#danger-alert-box-button').classList.remove('inactive-window');
    document.querySelector('#danger-alert-box').innerHTML = `${data} <span class='glyphicon glyphicon-remove pull-right'></span>`;
}
