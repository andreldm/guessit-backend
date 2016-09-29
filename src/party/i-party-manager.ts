import {IPlayer} from "../player/i-player";
import {ICard} from "../card/i-card";

export interface IBet{
	id:number;
	player:IPlayer;
	card:ICard;
	vitims:IPlayer[]
}