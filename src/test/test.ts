import {IPlayer} from "../interfaces/i-player";
import {ICard} from "../interfaces/i-card";
import {IBet} from "../interfaces/i-bet";
import partyManager from "../party/party-manager";

let processed: boolean = false;

partyManager.onReady.once(() => {
  // so pode iniciar depois de ler as cartas

  let player1: IPlayer = {
    id: '1'
    , name: 'player 1'
    , color: ''
    , score: 0
    , status: 0
    , deck: []
  };

  let player2: IPlayer = {
    id: '2'
    , name: 'player 2'
    , color: ''
    , score: 0
    , status: 0
    , deck: []
  };

  let player3: IPlayer = {
    id: '3'
    , name: 'player 3'
    , color: ''
    , score: 0
    , status: 0
    , deck: []
  };

  partyManager.join(player1);
  partyManager.join(player2);
  partyManager.join(player3);

  // partyManager.storytellerId = player1.id;
  // player1.status = EPlayerStatus.PICKING;

  let player1IdCard: number = player1.deck[2].id;
  let player2IdCard: number = player2.deck[1].id;
  let player3IdCard: number = player3.deck[4].id;

  partyManager.pickCard(player1.id, player1IdCard);

  partyManager.discardCard(player2.id, player2IdCard);

  // player3.name = "novo 3";
  // partyManager.renamePlayer(<any>{id:player3.id,name:"ops 3"});

  partyManager.discardCard(player3.id, player3IdCard);
  partyManager.betCard(player2.id, player1IdCard);
  partyManager.betCard(player3.id, player1IdCard);

  console.log(` 0/${player1.score}  - 2/${player2.score} - 2/${player3.score}`);
  player1IdCard = player1.deck[2].id;
  player2IdCard = player2.deck[1].id;
  player3IdCard = player3.deck[4].id;

  partyManager.pickCard(player2.id, player2IdCard);

  partyManager.discardCard(player1.id, player1IdCard);
  partyManager.discardCard(player3.id, player3IdCard);

  partyManager.betCard(player1.id, player3IdCard);
  partyManager.betCard(player3.id, player2IdCard);

  console.log(` 0/${player1.score}  - 5/${player2.score} - 6/${player3.score}`);

  player1IdCard = player1.deck[4].id;
  player2IdCard = player2.deck[3].id;
  player3IdCard = player3.deck[2].id;

  partyManager.pickCard(player3.id, player3IdCard);

  partyManager.discardCard(player1.id, player1IdCard);
  partyManager.discardCard(player2.id, player2IdCard);

  partyManager.betCard(player1.id, player2IdCard);
  partyManager.betCard(player2.id, player1IdCard);

  console.log(` 3/${player1.score}  - 8/${player2.score} - 6/${player3.score}`);

  processed = true;
  partyManager.onUpdate.emit(null);
});

partyManager.onUpdate.subscribe(() => {
  if (processed) {
    // console.log(playerStore.get());
  }
});

partyManager.onCardsBet.subscribe((cards: ICard[]) => {
  console.log('cards to select!');
  // console.log(cards);
});
partyManager.onBetsReveled.subscribe((bets: IBet[]) => {
  console.log('bets reveled!');
  // console.log(bets);
  // console.log(playerStore.get());
});
