import {ICard} from "../interfaces/i-card";
import {ECardStatus} from "../interfaces/e-card";
import {EventEmitter} from "event-emitter-lite";
import * as fs from 'fs';

class CardStore{
	private cards:ICard[];
	public onChange:EventEmitter<any> = new EventEmitter();
	constructor(){
		this.cards = [];
		fs.readdir('public/cards',(err:any,files:string[])=>{
			this.cards = files
				.filter(f=> f.indexOf('card-') > -1)
				.map((f, indx) => {
					return { id: indx + 1, url: `cards/${f}`, status: ECardStatus.FREE }
				});
			//console.log(this.cards);
		    this.onChange.emit(null);
		});
	}
	public getNewCard():ICard{
		let freeCards:ICard[] = this.cards
				.filter((card)=>card.status===ECardStatus.FREE);
		let randomIndx:number =	Math.floor((Math.random() * freeCards.length));
		freeCards[randomIndx].status = ECardStatus.USED;
		return freeCards[randomIndx];
	}
	public discard(pcard:ICard):CardStore{
		this.cards.every((card,indx)=>{
			if(pcard.id===card.id){
				this.cards[indx].status=ECardStatus.FREE;
				return false;
			}
			return true;
		});
		return this;
	}
	public getById(id:number):ICard{
		let indx:number = 0;
		this.cards.some((card,index)=>{
			if(card.id===id){
				indx = index;
				return true;
			}
			return false;
		});
		return this.cards[indx];
	}
	public get():ICard[]{
		return this.cards;
	}
	public getDeckCards():ICard[]{
		let myRandomCards:ICard[] = [];
		for(let i=0;i<6;i++){
			myRandomCards.push(this.getNewCard());
		}
		return myRandomCards;
	}
}
export default new CardStore();
