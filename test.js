    var message = `<div style='text-align: left;'>
    <style>
        li{
            padding-bottom: 3%;
        }

    </style>
    <ul>
        <li>In order for me to update the site, the server must be restarted. </li>

        <li>Any running games will be saved and you will be able to continue your games when you log in again.</li>

        <li>The server will only be down for a brief moment, at most 30 seconds.</li>

        <li>When you rejoin please use /roomChat to recover your chat.</li>

        <li>I apologise for the inconvenience caused. Thank you.</li>
    </ul>
    
    </div>`;

    Swal({
        title: "Server restarting!",
        html: message,
        type: "warning",
        



    }).then(() =>{
        // location.reload();
    });