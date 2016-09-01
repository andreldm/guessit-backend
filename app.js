var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var rcolor = require('./rcolor');
var cards = require('./cards');

var app = express();
var server =  http.Server(app);
var io = socketio(server);

var state = {
  players: new Map(),
  turnPlayer: undefined
}

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('join', function(playerName) {
    let player = state.players.get(socket.id);

    if (!player) {
      player = {
        id: socket.id,
        name: playerName,
        color: rcolor(),
        score: 0,
        deck: cards.getDeck()
      }

      state.players.set(socket.id, player);
    }

    io.emit('update-players', Array.from(state.players.values()));

    if (state.players.size == 3) {
      io.emit('start-game');

      state.turnPlayer = state.players.entries();
      let player = state.turnPlayer.next();
      io.sockets.socket(player.id).emit('your-turn');

    }
  });

  socket.on('disconnect', function () {
    state.players.delete(socket.id);
    io.emit('update-players', Array.from(state.players.values()));
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
