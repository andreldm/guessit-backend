let _ = require('lodash');
let PubSub = require('pubsub-js');

class TurnManager {
  constructor(io, cardManager, playerManager) {
    this.io = io;
    this.cardManager = cardManager;
    this.playerManager = playerManager;
    this.state = 's'; // 's' -> Storyteller picking, 'p' everybody Picking, 'b' everybody Betting
    PubSub.subscribe('PLAYER-DISCONNECTED', () => {
        if (this.state === 's') this.checkLeftBets();
        else if (this.state === 'p') this.checkLeftPicks();
        else if (this.state === 'b') this.checkLeftBets();
    });
  }

  handlePickCard(socket, cardId) {
    let player = this.playerManager.players.get(socket.id);
    player.pickedCard = cardId;

    let players = Array.from(this.playerManager.players.values());

    console.log(`${player.name} has picked card ${cardId}`);

    // Let others players pick cards
    if (this.playerManager.storyteller.id === player.id) {
      console.log("Allow other players to pick cards");
      PubSub.publish('CLOSE-MATCH');
      this.state = 'p';

      for (let p of players) {
        if (p.id === player.id) continue;
        this.io.to(p.id).emit('allow-pick-card');
      }
    }

    this.checkLeftPicks();
  }

  handlePickBet(socket, cardId) {
    let player = this.playerManager.players.get(socket.id);
    player.pickedBet = cardId;
    console.log(`${player.name} has picked bet ${cardId}`);

    this.checkLeftBets();
  }

  // Check if no one is left to picking cards
  checkLeftPicks () {
    let players = Array.from(this.playerManager.players.values());
    let left = players.filter(p => !p.pickedCard).length;
    if (left === 0) {
      console.log("Everybody is now picking bets");
      this.state = 'b';

      let pickedCards = players.map(p => this.cardManager.getCard(p.pickedCard));

      for (let p of players) {
        if (p.id !== this.playerManager.storyteller.id) {
          this.io.to(p.id).emit('allow-pick-bet', _.shuffle(pickedCards));
        }
      }
    }
  }

  // Check if no one is left picking bets
  checkLeftBets() {
    let players = Array.from(this.playerManager.players.values());

    let left = players.filter(p => !p.pickedBet).length;
    if (left === 1) { // 1 because the storyteller doesn't pick a bet
      console.log("Processing results...");
      PubSub.publish('OPEN-MATCH');

      this.processBets();
      this.io.emit('update-all', Array.from(this.playerManager.players.values())
      .map(p => {
        return {id: p.id, name: p.name, color: p.color, score: p.score}
      }));

      // check match winner
      let bestScore = _.orderBy(players, ['score'], ['desc'])[0].score;
      if (bestScore >= 30) {
        console.log("Game Over");
        this.io.emit('gameover', players);
        return;
      }

      // pick next storyteller
      PubSub.publish('NEXT-STORYTELLER');
      this.state = 's';
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

    /*
     * If nobody or everybody finds the correct picture, the storyteller scores
     * 0, and each of the other players scores 2. Otherwise the storyteller and
     * all players who found the correct answer score 3
     */
    if (winners.length === 0 || winners.length === (players.length - 1)) {
      for (let p of players) {
        if (p === storyteller) continue;
        p.score += 2;
      }
    } else {
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
