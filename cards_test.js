let cards = require('./cards.js');

let deck = cards.getDeck();
console.log(deck);

for (let i = 0; i < 50; i++) {
  let card = deck[0];
  deck.splice(0, 1);
  deck.push(cards.getCard(card));
  console.log(deck);
}
