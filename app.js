var express = require('express');
var http = require('http');
var socketio = require('socket.io');

var players = require('./players');

var app = express();
var server =  http.Server(app);
var io = socketio(server);

app.use(express.static('public'));

io.on('connection', function(socket){
  socket.on('join', function(playerName) { players.handleJoin(io, socket, playerName); });
  socket.on('disconnect', function () { players.handleDisconnect(io, socket); });
  socket.on('pick-card', function(cardId) { players.handlePickCard(io, socket, cardId); });
  socket.on('pick-bet', function(cardId) { players.handlePickBet(io, socket, cardId); });
});

server.listen(3000, function(){
  console.log('listening on :3000');
});
