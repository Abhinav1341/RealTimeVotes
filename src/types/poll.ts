export interface Option {
    text : string;
    votes : number;
}
export interface Poll {
    question : string;
    options : Option[];
    createdAt : Date;
}