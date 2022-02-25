import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  public key : any = {};
  public keyword = new BehaviorSubject<any>({});  
  
  constructor() { }

  getKeyword(){
    return this.keyword.asObservable();
  }
  
  search(k: any) {
     this.key = k;
     this.keyword.next(this.key);
  }
  

}
