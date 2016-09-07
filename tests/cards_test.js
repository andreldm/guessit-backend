let _ = require('lodash');
let CardManager = require('../card-manager.js');
let cardManager = new CardManager();

let decks = [
  cardManager.getDeck(),
  cardManager.getDeck(),
  cardManager.getDeck(),
  cardManager.getDeck(),
  cardManager.getDeck(),
  cardManager.getDeck()
];

for (let i = 0; i < 50; i++) {
  for (let deck of decks) {
    let index = deck[_.random(0, 5)];
    let c = deck[index];
    deck[index] = cardManager.exchangeCard(c);
  }
}

for (let i = 0; i < decks.length; i++) {
  console.log(`DECK ${i+1}: ` + JSON.stringify(decks[i], null, 2));
}
