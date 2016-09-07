let fs = require('fs');

class CardManager {
  constructor() {
    this.cards = [];

    let files = fs.readdirSync('public/cards');
    let index = 0;
    for (let f of files) {
      if (f.indexOf("card") > -1) {
        this.cards.push({id: ++index, url: `cards/${f}`});
      }
    }

    this.available = this.cards.slice();
    this.used = [];
  }

  getDeck() {
    let deck = [];

    for (let i = 0; i < 6; i++) {
      let index = Math.floor(Math.random() * (this.available.length - 6));
      let value = this.available[index];
      this.available.splice(index, 1);
      this.used.push(value);
      deck.push(value);
    }

    return deck;
  }

  exchangeCard(usedCard) {
    let index = Math.floor(Math.random() * (this.available.length - 6));
    let newCard = this.available[index];
    this.available.splice(index, 1);
    this.used.push(newCard);

    index = this.used.indexOf(usedCard);
    this.used.splice(index, 1);
    this.available.push(usedCard);

    return newCard;
  }

  getCard(cardId) {
    return this.cards[cardId - 1];
  }

  reset() {
    this.available = this.cards.slice();
    this.used = [];
  }
}

module.exports = CardManager;
