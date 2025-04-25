import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StoreUserService {

  private fullName$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");


  constructor() { }

  

  public getRoleFromStore(){
    return this.role$.asObservable();
  }

  public setRole(role:string){
    this.role$.next(role);
  }

  public getFullnameFromStore(){
    return this.fullName$.asObservable();
  }

  public setFullname(fullname:string){
    this.fullName$.next(fullname);
  }

}
