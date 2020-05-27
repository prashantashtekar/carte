export class CustomerRequest {
    public id: string = "";
    public customerId: string = "";
    public customerName: string = "";
    public customerPhoneNumber: string = "";
    public customerLatitude: string = "";
    public customerLongitude: string = "";
    public cartUserId: string = "";
    public status: string = "";
    public dateRequested: string = "";
    public selectedOptions: any= [];
    public messages: Message[] = [];
};

export class Message {
    public dateTime: Date;
    public from: string;
    public message: string;
};
//Customer
//Requested
//Cancelled - user or (date < today)

//CartUser
//Accepted
//Rejected