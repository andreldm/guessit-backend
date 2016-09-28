import {IPlayer} from "./i-player";
import {EPlayerStatus} from "./e-player";
import {ICard} from "../card/i-card";
import {ECardStatus} from "./card/e-card";
import cardStore from "../card/card-store";
import {EventEmitter} from "event-emitter-lite";


class PlayerStore{
	private players:IPlayer[];
	public onChange:EventEmitter<any> = new EventEmitter();
	constructor(){
		this.players = [];

		this.onChange.emit(null);
		
	}
	public add(p_player:IPlayer):void{
		let hasPlayer:boolean = false;
		if(this.players.length > 0){
			hasPlayer = this.players
								.some((player)=>p_player.id===player.id);
		}
		if(!hasPlayer){
			p_player.deck = cardStore.getDeckCards();
			p_player.color = this.getColor();
			this.players.push(p_player);
		}else{
			this.getById(p_player.id).name = p_player.name;
		}
		this.onChange.emit(null);
	}
	public get():IPlayer[]{
		return this.players;
	}
	public getById(id:string):IPlayer{
		let indx:number = 0;
		this.players.some((player,index)=>{
			if(player.id===id){
				indx = index;
				return true;
			}
			return false;
		});
		return this.players[indx];
	}
	private getColor():string{
		let letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
  		return color;
	}
	public set(players:IPlayer[]):void{
		this.players = players;
		this.onChange.emit(null);
	}
}
export default new PlayerStore();