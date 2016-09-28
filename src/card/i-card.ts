import {ECardStatus} from "./e-card";

export interface ICard{
	id:number;
	url:string;
	status:ECardStatus;
}