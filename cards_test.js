var cards = require('./cards.js');

var deck = cards.getDeck();
console.log(deck);

for (let i = 0; i < 50; i++) {
  var card = deck[0];
  deck.splice(0, 1);
  deck.push(cards.getCard(card));
  console.log(deck);
}
