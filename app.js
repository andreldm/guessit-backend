var app = require('express')();
var http = require('http');
var socketio = require('socket.io');
var rcolor = require('./rcolor');

var server =  http.Server(app);
var io = socketio(server);

var players = new Map();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('join', function(playerName) {
    let player = players.get(socket.id);
    if (!player) {
      player = {id: socket.id, name: playerName, color: rcolor(), score: 0}
      players.set(socket.id, player);
    }

    io.emit('update-players', Array.from(players.values()));
  });

  socket.on('disconnect', function () {
    players.delete(socket.id);
    io.emit('update-players', Array.from(players.values()));
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
