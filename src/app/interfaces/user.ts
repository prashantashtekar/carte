export class User {
    uid: string = "";
    email: string = "";
    firstName?: string = "";
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    roleName?: string;
    cartId?: string;
    cartName?: string;
    isActive?: boolean;
    isCartActive: boolean;
    location: Location[] = [];
}

export class Location {
    public uid: string;
    public latitude?: string;
    public longitude?: string;
    public timestamp: Date;

}