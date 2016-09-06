let rcolor = require('./rcolor');
let _ = require('lodash');

class PlayerManager {
  constructor(cardManager) {
    this._players = new Map();
    this._storyteller = undefined;
    this.cardManager = cardManager;
  }

  get players() { return this._players; }
  set players(players) { this._players = players; }
  get storyteller() { return this._storyteller; }
  set storyteller(player) { this._storyteller = player; }

  handleJoin (io, socket, playerName) {
    if (!playerName || !playerName.trim()) {
      console.log("Invalid player name");
      return;
    }

    let player = this.players.get(socket.id);

    if (player) {
      console.log(`${playerName} has already joined, skipping...`);
      return;
    }

    player = {
      id: socket.id,
      name: playerName,
      color: rcolor(),
      score: 0,
      deck: this.cardManager.getDeck(),
      pickedCard: undefined,
      pickedBet: undefined
    }
    this.players.set(socket.id, player);

    console.log(`${playerName} has joined`);

    io.emit('update-all', Array.from(this.players.values()).map(p => {
      return {p: p.id, name: p.name, color: p.color, score: p.score}
    }));

    io.to(player.id).emit('update', player);

    if (!this.storyteller || this.storyteller.name === player.name) {
      this.storyteller = player;
      io.to(player.id).emit('allow-pick-card');
      console.log(`${playerName} is now picking a card`);
    }
  }

  handleDisconnect (io, socket) {
    let player = this.players.get(socket.id);
    if (player) {
      console.log(`${player.name} has disconnected`);
      this.players.delete(socket.id);
    }

    io.emit('update-all', Array.from(this.players.values()).map(p => {
      return {p: p.id, name: p.name, color: p.color, score: p.score}
    }));
  }

  nextStoryteller(io) {
    let newStoryteller = undefined;
    let storyteller = this.storyteller;
    let players = Array.from(this.players.values());

    for (let i = 0; i < players.length; i++) {
      let p = players[i];

      // Exchange the used card
      let newCard = this.cardManager.exchangeCard(p.pickedCard);
      p.deck[_.findIndex(p.deck, {'id': p.pickedCard})] = newCard;

      // Clear picks
      p.pickedCard = undefined;
      p.pickedBet = undefined;

      // If this player is the storyteller, pick the next one
      if (p === storyteller) {
        newStoryteller = (i === players.length - 1) ?
          players[0] : players[i + 1];
      }

      io.to(p.id).emit('update', p);
    }

    this.storyteller = newStoryteller;
    io.to(this.storyteller.id).emit('allow-pick-card');
  }

  reset() {
    this.players = new Map();
    this.storyteller = undefined;
  }
}

module.exports = PlayerManager;
