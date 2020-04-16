export class Product {
    public id: string = "";
    public name: string = "";
    public description: string = "";
    public photo?: string;
    public price: string;
    public isActive: boolean =true;
    public isOutOfStock:boolean=false;
    public qty?: number;
    public cartUserId:string;
};