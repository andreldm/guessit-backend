var rcolor = require('./rcolor');
var cards = require('./cards');

module.exports = function(){
  let players = new Map();
  let turnPlayer = undefined;

  return {
    handleJoin: function(io, socket, playerName) {
      let player = players.get(socket.id);

      if (player) {
        console.log(`${playerName} has already joined, skipping...`);
        return;
      }

      player = {
        id: socket.id,
        name: playerName,
        color: rcolor(),
        score: 0,
        deck: cards.getDeck()
      }
      players.set(socket.id, player);

      console.log(`${playerName} has joined`);

      io.emit('update-players', Array.from(players.values()).map(p => {
        return {name: p.name, color: p.color, score: p.score}
      }));
      io.to(player.id).emit('confirm-join', player);

      if (!turnPlayer) {
        turnPlayer = player;
        io.to(player.id).emit('pick-card');
        console.log(`${playerName} is now picking a card`);
      }
    },

    handleDisconnect: function(io, socket) {
      let player = players.get(socket.id);
      if (player) {
        console.log(`${player.name} has disconnected`);
        players.delete(socket.id);
      }

      io.emit('update-players', Array.from(players.values()));
    },
}}();
