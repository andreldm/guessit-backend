let CardManager = require('../card-manager.js');
let cardManager = new CardManager();

let deck = cardManager.getDeck();
console.log(deck);

for (let i = 0; i < 50; i++) {
  let card = deck[0];
  deck.splice(0, 1);
  deck.push(cardManager.exchangeCard(card));
  console.log(deck);
}
