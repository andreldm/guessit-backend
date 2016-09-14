let fs = require('fs');
let _ = require('lodash');

class CardManager {
  constructor() {
    this.cards = [];
    this.available = [];
    this.index = 0;

    let id = 0;
    let files = fs.readdirSync('public/cards');
    for (let f of files) {
      if (/^.+\.(jpg|jpeg|png)$/.test(f)) {
        this.cards.push({id: ++id, url: `cards/${f}`});
      }
    }

    this.available = _.shuffle(this.cards.slice());
  }

  getDeck() {
    if (this.index + 6 >= this.available.length) {
      this.index = 0;
      this.available = _.shuffle(this.available);
    }

    let deck = this.available.splice(this.index, 6);
    this.index += 6;

    return deck;
  }

  exchangeCard(usedCard) {
    if (this.index + 1 >= this.available.length) {
      this.index = 0;
      this.available = _.shuffle(this.available);
    }

    let newCard = this.available.splice(this.index++, 1)[0];
    this.available.push(this.getCard(usedCard));

    return newCard;
  }

  getCard(cardId) {
    return this.cards[cardId - 1];
  }

  reset() {
    this.available = _.shuffle(this.cards.slice());
  }
}

module.exports = CardManager;
