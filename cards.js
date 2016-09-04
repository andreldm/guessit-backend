let fs = require('fs');

module.exports = function(){
  let cards = [];

  let files = fs.readdirSync('public/cards')
  for (f of files) {
    if (/^card-\d+\.jpg$/.test(f)) {
        let index = /^card-(\d+)\.jpg$/.exec(f)[1];
        cards.push({id: index, name: 'card' + index, url: `cards/${f}`});
    }
  }

  let available = cards.slice();
  let used = [];

  return {
    getDeck: function() {
      let deck = [];
      for (let i = 0; i < 6; i++) {
        let index = Math.floor(Math.random() * (available.length - 6));
        let value = available[index];
        available.splice(index, 1);
        deck.push(value);
        used.push(value);
      }
      return deck;
    },

    exchangeCard: function(usedCard) {
      let index = Math.floor(Math.random() * (available.length - 6));
      let newCard = available[index];
      available.splice(index, 1);
      used.push(newCard);

      index = used.indexOf(usedCard);
      used.splice(index, 1);
      available.push(usedCard);

      return newCard;
    },

    getCard: function(cardId) {
      return cards[cardId - 1];
    }
}}();
