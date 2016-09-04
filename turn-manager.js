let _ = require('lodash');
let CardManager = require('./card-manager');

class TurnManager {
  constructor(cardManager, playerManager) {
    this.cardManager = cardManager
    this.playerManager = playerManager;
  }

  handlePickCard(io, socket, cardId) {
    let player = this.playerManager.players.get(socket.id);
    player.pickedCard = cardId;

    let playersArray = Array.from(this.playerManager.players.values());

    console.log(`${player.name} has picked card ${cardId}`);

    // Let others players pick cards
    if (this.playerManager.turnPlayer.id === player.id) {
      console.log("Allow other players to pick cards");

      for (let p of playersArray) {
        if (p.id === player.id) continue;
        io.to(p.id).emit('allow-pick-card');
      }
    }

    // Check if no one is left to picking cards
    let left = playersArray.filter(p => !p.pickedCard).length;
    if (left === 0) {
      let pickedCards = playersArray.map(p => this.cardManager.getCard(p.pickedCard));

      for (let p of playersArray) {
        if (p.id !== this.playerManager.turnPlayer.id) {
          io.to(p.id).emit('allow-pick-bet', _.shuffle(pickedCards));
        }
      }

      console.log("Everybody is now picking bets");
    }
  }

  handlePickBet(io, socket, cardId) {
    let player = this.playerManager.players.get(socket.id);
    player.pickedBet = cardId;
    console.log(`${player.name} has picked bet ${cardId}`);

    // Check if no one is left picking bets
    let playersArray = Array.from(this.playerManager.players.values());

    let left = playersArray.filter(p => !p.pickedBet).length;
    if (left === 1) { // 1 because the turnPlayer doesn't pick a bet
      console.log("Processing results...");
    }
  }
}

module.exports = TurnManager;
