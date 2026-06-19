export interface User {
  id : number;
  name : string;
  email : string;
  password : string;
  created_at : Date;

}

export interface JwtPayload {
  userId: number;
  email: string;

}
export interface Transaction {
  id : number;
  user_id : number;
  category_id : number;
  type : "income" | "expense";
  amount : number ;
  description : string;
  date : string;
  created_at : Date;
}

export interface Category {
  id : number;
  name: string ;
  type : "income" | "expense";
  user_id : number;
}