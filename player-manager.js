let rcolor = require('./rcolor');

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
      return {name: p.name, color: p.color, score: p.score}
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
      return {name: p.name, color: p.color, score: p.score}
    }));
  }

  reset() {
    this.players = new Map();
    this.storyteller = undefined;
  }
}

module.exports = PlayerManager;
