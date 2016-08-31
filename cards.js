module.exports = function(){
  let cards = [];
  // mock cards
  for (let i = 1; i <= 84; i++)
    cards.push({id: i, name: 'card' + i});

  let available = [...Array(cards.length).keys()];
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

    getCard: function(usedCard) {
      let index = Math.floor(Math.random() * (available.length - 6));
      let newCard = available[index];
      available.splice(index, 1);
      used.push(newCard);

      index = used.indexOf(usedCard);
      used.splice(index, 1);
      available.push(usedCard);

      return newCard;
    },
}}();
