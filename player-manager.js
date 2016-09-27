let _ = require('lodash');
let PubSub = require('pubsub-js');
let rcolor = require('./rcolor');

class PlayerManager {
  constructor(io, cardManager) {
    this.io = io;
    this._players = new Map();
    this._storyteller = undefined;
    this.cardManager = cardManager;
    this.disconnected = new Map();
    this.awaiting = [];
    this.matchOpen = true; // open to new players or reconnections
    PubSub.subscribe('OPEN-MATCH', () => {
      this.matchOpen = true;
      this.flushAwaitingPlayers();
    });
    PubSub.subscribe('CLOSE-MATCH', () => this.matchOpen = false);
    PubSub.subscribe('NEXT-STORYTELLER', () => this.nextStoryteller());
  }

  get players() { return this._players; }
  set players(players) { this._players = players; }
  get storyteller() { return this._storyteller; }
  set storyteller(player) { this._storyteller = player; }

  handleJoin (socket, playerName) {
    if (!playerName || !playerName.trim()) {
      console.log("Invalid player name");
      return;
    }

    let player = this.players.get(socket.id);

    if (player) {
      console.log(`${playerName} has already joined, skipping...`);
      return;
    }

    player = this.disconnected.get(playerName);
    if (player) {
      this.disconnected.delete(player.name);
      player.id = socket.id;
    } else {
      player = {
        id: socket.id,
        name: playerName,
        color: rcolor(),
        score: 0,
        deck: this.cardManager.getDeck(),
        pickedCard: undefined,
        pickedBet: undefined
      }
    }

    if (!this.matchOpen) {
      console.log(`${playerName} has already joined, but is awaiting the next turn...`);
      this.io.to(player.id).emit('waiting', player);
      this.awaiting.push(player);
      return;
    }

    this.players.set(socket.id, player);
    this.publishPlayer(player);
  }

  flushAwaitingPlayers() {
    for (let player of this.awaiting) {
      console.log(`${player.name} is now joining`);
      this.publishPlayer(player);
    }

    this.awaiting = [];
  }

  publishPlayer(player) {
    console.log(`${player.name} has joined`);

    this.io.emit('update-all', Array.from(this.players.values()).map(p => {
      return {id: p.id, name: p.name, color: p.color, score: p.score}
    }));

    this.io.to(player.id).emit('update', player);

    if (!this.storyteller || this.storyteller.name === player.name) {
      this.storyteller = player;
      this.io.to(player.id).emit('allow-pick-card');
      console.log(`${player.name} is now picking a card`);
    }
  }

  handleDisconnect (socket) {
    let player = this.players.get(socket.id);
    if (player) {
      console.log(`${player.name} has disconnected`);
      this.players.delete(socket.id);
      this.disconnected.set(player.name, player);
      this.cardManager.returnCards(player.deck);

      PubSub.publish('PLAYER-DISCONNECTED', player);

      this.io.emit('update-all', Array.from(this.players.values()).map(p => {
        return {id: p.id, name: p.name, color: p.color, score: p.score}
      }));
    }
  }

  nextStoryteller() {
    let storyteller = this.storyteller;
    let newStoryteller = undefined;
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
      if (p.id === storyteller.id) {
        newStoryteller = (i === players.length - 1) ?
          players[0] : players[i + 1];
      }

      this.io.to(p.id).emit('update', p);
    }

    this.storyteller = newStoryteller;
    this.io.to(this.storyteller.id).emit('allow-pick-card');
    console.log(`${newStoryteller.name} is now the storyteller`);
  }

  reset() {
    this.players = new Map();
    this.storyteller = undefined;
    this.disconnected = new Map();
    this.awaiting = [];
    this.matchOpen = true;
  }
}

module.exports = PlayerManager;
