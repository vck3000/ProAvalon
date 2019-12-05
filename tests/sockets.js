var socket = require('socket.io-client')('http://localhost');
socket.on('connect', function(){
    console.log("CONNECTED!");
});

console.log("HI");
// socket.on('event', function(data){});
// socket.on('disconnect', function(){});