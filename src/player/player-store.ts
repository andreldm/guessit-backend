import {IPlayer} from "../interfaces/i-player";
import cardStore from "../card/card-store";
import {EventEmitter} from "event-emitter-lite";

class PlayerStore {
  private players: IPlayer[];
  public onChange: EventEmitter<any> = new EventEmitter();
  constructor() {
    this.players = [];

    this.onChange.emit(null);

  }
  public add(player: IPlayer): void {
    let hasPlayer: boolean = false;
    if (this.players.length > 0) {
      hasPlayer = this.players.some(p => player.id === p.id);
    }
    if (!hasPlayer) {
      player.deck = cardStore.getDeckCards();
      player.color = this.getColor();
      this.players.push(player);
    } else {
      this.getById(player.id).name = player.name;
    }
    this.onChange.emit(null);
  }
  public get(): IPlayer[] {
    return this.players;
  }
  public getById(id: string): IPlayer {
    let indx: number = 0;
    this.players.some((player, index) => {
      if (player.id === id) {
        indx = index;
        return true;
      }
      return false;
    });
    return this.players[indx];
  }
  private getColor(): string {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  public set(players: IPlayer[]): void {
    this.players = players;
    this.onChange.emit(null);
  }
}
export default new PlayerStore();
