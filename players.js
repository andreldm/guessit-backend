var _ = require('lodash');
var rcolor = require('./rcolor');
var cards = require('./cards');

module.exports = function(){
  let players = new Map();
  let turnPlayer = undefined;

  return {
    handleJoin: function(io, socket, playerName) {
      if(!playerName || !playerName.trim()) {
        console.log("Invalid player name");
        return;
      }

      let player = players.get(socket.id);

      if (player) {
        console.log(`${playerName} has already joined, skipping...`);
        return;
      } else {
        player = {
          id: socket.id,
          name: playerName,
          color: rcolor(),
          score: 0,
          deck: cards.getDeck(),
          pickedCard: undefined,
          pickedBet: undefined
        }
        players.set(socket.id, player);

        console.log(`${playerName} has joined`);
      }

      io.emit('update-all', Array.from(players.values()).map(p => {
        return {name: p.name, color: p.color, score: p.score}
      }));
      io.to(player.id).emit('update', player);

      if (!turnPlayer || turnPlayer.name === player.name) {
        turnPlayer = player;
        io.to(player.id).emit('allow-pick-card');
        console.log(`${playerName} is now picking a card`);
      }
    },

    handleDisconnect: function(io, socket) {
      let player = players.get(socket.id);
      if (player) {
        console.log(`${player.name} has disconnected`);
        players.delete(socket.id);
      }

      io.emit('update-all', Array.from(players.values()).map(p => {
        return {name: p.name, color: p.color, score: p.score}
      }));
    },

    handlePickCard: function(io, socket, cardId) {
      let player = players.get(socket.id);
      player.pickedCard = cardId;

      let playersArray = Array.from(players.values());

      console.log(`${player.name} has picked card ${cardId}`);

      // Let others players pick cards
      if (turnPlayer.id === player.id) {
        console.log("Allow other players to pick cards");

        for (p of playersArray) {
          if (p.id === player.id) continue;
          io.to(p.id).emit('allow-pick-card');
        }
      }

      // Check if no one is left to picking cards
      let left = playersArray.filter(p => !p.pickedCard).length;
      if (left === 0) {
        let selectedCards = playersArray.map(p => cards.getCard(p.pickedCard));
        io.emit('allow-pick-bet', _.shuffle(selectedCards));
        console.log("Everybody is now picking bets");
      }
    },

    handlePickBet: function(io, socket, cardId) {
      let player = players.get(socket.id);
      player.pickedBet = cardId;
      console.log(`${player.name} has picked bet ${cardId}`);

      // Check if no one is left picking bets
      let playersArray = Array.from(players.values());

      let left = playersArray.filter(p => !p.pickedBet).length;
      if (left === 0) {
        console.log("Processing results...");
      }
    },
}}();
