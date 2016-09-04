let express = require('express');
let http = require('http');
let socketio = require('socket.io');

let PlayerManager = require('./player-manager');
let TurnManager = require('./turn-manager');
let CardManager = require('./card-manager');

let app = express();
let server = http.Server(app);
let io = socketio(server);
let cardManager = new CardManager();
let playerManager = new PlayerManager(cardManager);
let turnManager = new TurnManager(cardManager, playerManager);

app.use(express.static('public'));

io.on('connection', function(socket){
  socket.on('join', function(playerName) { playerManager.handleJoin(io, socket, playerName); });
  socket.on('disconnect', function () { playerManager.handleDisconnect(io, socket); });
  socket.on('pick-card', function(cardId) { turnManager.handlePickCard(io, socket, cardId); });
  socket.on('pick-bet', function(cardId) { turnManager.handlePickBet(io, socket, cardId); });
});

server.listen(3000, function() {
  console.log('listening on :3000');
});
