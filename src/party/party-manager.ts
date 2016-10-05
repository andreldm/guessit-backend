import {EventEmitter} from "event-emitter-lite";
import cardStore from "../card/card-store";
import playerStore from "../player/player-store";
import {EPlayerStatus} from "../interfaces/e-player";
import {IPlayer} from "../interfaces/i-player";
import {ICard} from "../interfaces/i-card";
import {IBet} from "../interfaces/i-bet";

class PartyManager {
  public onReady: EventEmitter<boolean> = new EventEmitter();
  public onUpdate: EventEmitter<any> = new EventEmitter();
  public onCardsBet: EventEmitter<ICard[]> = new EventEmitter();
  public onGameOver: EventEmitter<IPlayer> = new EventEmitter();
  public onBetsReveled: EventEmitter<IBet[]> = new EventEmitter();
  public storytellerId: string;
  private cardsInBet: ICard[];
  constructor() {
    this.storytellerId = "";
    this.cardsInBet = [];
    cardStore.onChange.once(() => {
      this.onReady.emit(true);
    });
  }

  public renamePlayer(player: { name: string, id: string }): void {
    console.log(`player ${player.id} has renamed to ${player.name}!`);
    let playerFromStore: IPlayer = playerStore.getById(player.id);
    playerFromStore.name = player.name;
  }

  public join(p: { name: string, id: string }): void {
    let player: IPlayer = Object.assign({}, p, {
      color: '',
      deck: [],
      status: EPlayerStatus.WAITING,
      score: 0
    });

    if (playerStore.get().length === 0) {
      player.status = EPlayerStatus.PICKING;
      this.storytellerId = player.id;
    }

    playerStore.add(player);

    console.log(`player ${player.name} has connected!`);
    this.onUpdate.emit(null);

    let playerFromStore: IPlayer = playerStore.getById(player.id);
    if (playerFromStore.status === EPlayerStatus.BETING || playerFromStore.status === EPlayerStatus.WATCHING_BET) {
      this.onCardsBet.emit(this.cardsInBet);
    }
  }

  // apostando
  public betCard(playerId: string, cardId: number): void {
    let player = playerStore.getById(playerId);
    if (player.status === EPlayerStatus.BETING) {
      player.pickedBet = cardId;
      console.log(`${player.name} has bet card ${cardId}`);
      player.status = EPlayerStatus.WATCHING_BET;
      this.doDiscard(cardId, player);

      let hasInBet: boolean = playerStore
        .get()
        .some(p => p.status === EPlayerStatus.BETING && p.id !== this.storytellerId);
      // console.log(hasInBet);
      if (!hasInBet) {

        this.processBets();

        // qualcular e escolher o proximo storyteller
        let nextIndex: number = 0;
        playerStore
          .get()
          .some((p, indx) => {
            nextIndex = indx + 1;
            return p.id === this.storytellerId;
          });
        if (nextIndex === playerStore.get().length) {
          nextIndex = 0;
        }
        this.storytellerId = playerStore.get()[nextIndex].id;
        let nexStoryTeller = playerStore.getById(this.storytellerId);
        nexStoryTeller.status = EPlayerStatus.PICKING;
        console.log(`next storyteller ${nexStoryTeller.name}`);

        playerStore.get().forEach((p) => {
          p.deck.push(cardStore.getNewCard());
        });

        // verifica se existe vencendor
        let winner: IPlayer[] = playerStore.get().filter(p => p.score >= 30);
        if (winner.length) {
          this.onGameOver.emit(winner[0]);
        }
      }

    }
    this.onUpdate.emit(null);
  }
  // trolando
  public discardCard(playerId: string, cardId: number): void {
    let player = playerStore.getById(playerId);
    let allPlayerDiscarded: boolean = false;
    if (player.status === EPlayerStatus.DISCARDING) {
      player.pickedCard = cardId;
      console.log(`${player.name} has discard card ${cardId}`);
      player.status = EPlayerStatus.WAITING;
      this.doDiscard(cardId, player);

      allPlayerDiscarded = playerStore
        .get()
        .filter(playerDiscarding => playerDiscarding.id !== this.storytellerId)
        .every(playerDiscarding => playerDiscarding.status === EPlayerStatus.WAITING);
      // console.log(allPlayerDiscarded);
      if (allPlayerDiscarded) {
        // every player has discarded
        let betCards: number[] = [];
        playerStore
          .get()
          // .filter(playerReady=>playerReady.id!==this.storytellerId)
          .forEach((playerReady) => {
            if (playerReady.id !== this.storytellerId) {
              playerReady.status = EPlayerStatus.BETING;
            }
            betCards.push(playerReady.pickedCard);
          });
        this.cardsInBet = this.shuffleCards(cardStore.get().filter((card) => betCards.indexOf(card.id) > -1));
      }
    }
    this.onUpdate.emit(null);
    if (allPlayerDiscarded) {
      this.onCardsBet.emit(this.cardsInBet);
    }
  }
  private shuffleCards(cards: ICard[]): ICard[] {
    for (let i = cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
    return cards;
  }
  public reset(): void {
    let players = playerStore.get();
    players.forEach(player => {
      player.deck = [];
      player.score = 0;
      player.status = EPlayerStatus.WAITING;
    });
    if (players.length) {
      players[0].status = EPlayerStatus.PICKING;
      this.storytellerId = players[0].id;
    }
    playerStore.set(players);
    this.cardsInBet = [];
  }
  // narrador escolhendo uma carta
  public pickCard(playerId: string, cardId: number): void {
    let player = playerStore.getById(playerId);
    if (player.status === EPlayerStatus.PICKING && player.id === this.storytellerId) {
      player.pickedCard = cardId;
      console.log(`${player.name} has picked card ${cardId}`);
      // Let others players pick cards
      if (this.storytellerId === player.id) {
        console.log("Allow other players to pick cards");
        playerStore
          .get()
          .filter((p) => p.id !== player.id)
          .forEach(p => p.status = EPlayerStatus.DISCARDING);
      }
      player.status = EPlayerStatus.WATCHING_BET;
      this.doDiscard(cardId, player);
    }
    this.onUpdate.emit(null);
  }

  private doDiscard(cardId: number, player: IPlayer): void {
    let indxStotytellerCard = -1;
    player.deck.some((deckCard, indx) => {
      if (deckCard.id === cardId) {
        indxStotytellerCard = indx;
        return true;
      }
      return false;
    });

    if (indxStotytellerCard > -1) {
      cardStore.discard(player.deck[indxStotytellerCard]);
      player.deck.splice(indxStotytellerCard, 1);
    }
  }
  private processBets() {
    let storyteller = playerStore.getById(this.storytellerId);
    /*
     * If nobody or everybody finds the correct picture, the storyteller scores
     * 0, and each of the other players scores 2. Otherwise the storyteller and
     * all players who found the correct answer score 3
     */
    let playersVoters: IPlayer[] = playerStore
      .get()
      .filter(p => p.id !== this.storytellerId);

    let allVotersInStoryteller: boolean = playersVoters
      .every(p => p.pickedBet === storyteller.pickedCard);

    let noVotersInStoryteller: boolean = playersVoters
      .every(p => p.pickedBet !== storyteller.pickedCard);

    if (allVotersInStoryteller) {
      // todos acertaram - narrador foi muito obvio
      playersVoters.forEach(p => p.score += 2);
    } else if (noVotersInStoryteller) {
      // ninguem acertou - narrador foi muito vago
      playersVoters.forEach(p => p.score += 2);
    } else {
      // o storyteller e todos que acertaram ganham 3 pontos
      storyteller.score += 3;
      playersVoters
        .filter(p => p.pickedBet === storyteller.pickedCard)
        .forEach(p => p.score += 3);
    }
    // dar pontuacoes ao playes pelas armadilhas
    playersVoters
      .forEach((p) => {
        playersVoters
          .filter(p2 => p2.id !== p.id && p2.pickedBet === p.pickedCard)
          .forEach(() => p.score++);
      });
    this.processBetPanel();

  }
  private processBetPanel(): void {
    this.onBetsReveled.emit(
      playerStore.get().map((player, indx) => {
        return {
          id: indx
          , player: player
          , card: cardStore.getById(player.pickedCard)
          , voters: playerStore
            .get()
            .filter(voter => voter.pickedBet === player.pickedCard)
        };
      })
    );
  }
}

export default new PartyManager();
