let express = require('express');
let http = require('http');
let socketio = require('socket.io');

let partyManager = require("./dist/party/party-manager");
let playerStore  = require("./dist/player/player-store");

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

app.get('/reset', function (req, res) {
  console.log("Resetting...");
  partyManager.default.reset();
  res.send("reset done!");
});

partyManager.default.onGameOver.subscribe((winner)=>{
  io.emit('gameover', winner);
});
partyManager.default.onCardsBet.subscribe((cards)=>{
  console.log('send cards to bet!');
  io.emit('cards-bet', cards);
});
partyManager.default.onUpdate.subscribe(()=>{
  console.log('update all players!');
  io.emit('update-all', playerStore.default.get());
});

io.on('connection',(socket)=>{  
  socket.on('join',(playerId,playerName)=>{
    partyManager.default.join({
      id:playerId
      ,name:playerName
    });
  });
  //socket.on('disconnect', function () { playerManager.handleDisconnect(io, socket); });
  //socket.on('reconnect-player',(playerId,playerName)=>{ playerManager.handleReconnect(io, socket, playerId, playerName); }); 
  socket.on('pick-card', function(playerId,cardId) { 
    partyManager.default.pickCard(playerId,cardId); 
  });
  socket.on('pick-bet', function(playerId,cardId) { 
    partyManager.default.betCard(playerId,cardId); 
  });
  socket.on('discard-card', function(playerId,cardId) { 
    partyManager.default.discardCard(playerId,cardId); 
  });
  socket.on('rename-player', function(playerId,newName) { 
    partyManager.default.renamePlayer({id:playerId,name:newName}); 
  });
});

server.listen(app.get('port'), function() {
  console.log(`listening on :${app.get('port')}`);
});
