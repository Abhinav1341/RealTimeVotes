export interface Option {
    text : string;
    votes : number;
}
export interface Poll {
    _id?: string;
    question : string;
    options : Option[];
    createdAt : Date;
}