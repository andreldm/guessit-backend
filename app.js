var express = require('express');
var http = require('http');
var socketio = require('socket.io');

var players = require('./players');

var app = express();
var server =  http.Server(app);
var io = socketio(server);

io.on('connection', function(socket){
  socket.on('join', function(playerName) { players.handleJoin(io, socket, playerName); });
  socket.on('disconnect', function () { players.handleDisconnect(io, socket); });
});

server.listen(3000, function(){
  console.log('listening on :3000');
});
