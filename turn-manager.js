let _ = require('lodash');

class TurnManager {
  constructor(cardManager, playerManager) {
    this.cardManager = cardManager
    this.playerManager = playerManager;
  }

  handlePickCard(io, socket, cardId) {
    let player = this.playerManager.players.get(socket.id);
    player.pickedCard = cardId;

    let players = Array.from(this.playerManager.players.values());

    console.log(`${player.name} has picked card ${cardId}`);

    // Let others players pick cards
    if (this.playerManager.storyteller.id === player.id) {
      console.log("Allow other players to pick cards");

      for (let p of players) {
        if (p.id === player.id) continue;
        io.to(p.id).emit('allow-pick-card');
      }
    }

    // Check if no one is left to picking cards
    let left = players.filter(p => !p.pickedCard).length;
    if (left === 0) {
      let pickedCards = players.map(p => this.cardManager.getCard(p.pickedCard));

      for (let p of players) {
        if (p.id !== this.playerManager.storyteller.id) {
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
    let players = Array.from(this.playerManager.players.values());

    let left = players.filter(p => !p.pickedBet).length;
    if (left === 1) { // 1 because the storyteller doesn't pick a bet
      console.log("Processing results...");
      this.processBets();
      io.emit('update-all', Array.from(this.playerManager.players.values())
      .map(p => {
        return {p: p.id, name: p.name, color: p.color, score: p.score}
      }));

      // pick next storyteller
      this.playerManager.nextStoryteller(io);
    }
  }

  processBets() {
    let storyteller = this.playerManager.storyteller;
    let players = Array.from(this.playerManager.players.values());
    let playerByCard = new Map();
    let winners = [];
    for (let p of players) {
        playerByCard.set(p.pickedCard, p);
    }

    for (let p1 of players) {
      if (p1 === storyteller) continue;
      let p2 = playerByCard.get(p1.pickedBet);
      if (!p2) continue;

      if (p2 === storyteller) winners.push(p1);
      // ignore voting on own card
      else if (p1.id !== p2.id) p2.score++;
    }

    if (winners.length > 0) {
      // If everybord has won, the storyteller doesn't score
      if (winners.length < (players.length - 1))
        storyteller.score += 3;

      for (let p of winners)
        p.score +=3;
    }
  }

  reset() {
    // nothing to reset
  }
}

module.exports = TurnManager;
