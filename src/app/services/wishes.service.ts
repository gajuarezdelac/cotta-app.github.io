import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishesService {
  
  public itemList : any = []
  public wishesList = new BehaviorSubject<any>([]);  

  constructor() { }

  getWhishes() { 
    return this.wishesList.asObservable();
  }

  // Almacenamos de manera inicial los productos
  setProduct(lst : any){
    this.itemList = [];
    this.itemList.push(...lst);
    this.wishesList.next(this.itemList);
  }
  
  addtoWishes(product : any){
    this.itemList = this.updateWishes(product);
    this.wishesList.next(this.itemList);
    localStorage.setItem('MyWhises_Cotta', JSON.stringify(this.wishesList.value));
  }

  updateWishes(product : any){
    // En caso de que exista un producto con las mismas caracteristicas este se elimina
    this.itemList.map((a:any, index:any)=>{
      if(product.id == a.id && product.code == a.code){
        this.itemList.splice(index,1);
      }
    });

    // Se inserta el nuevo independientemente si existe o no
    this.itemList.push(product);

    console.log(this.itemList);
    return this.itemList;
  }

   removeItem(product: any){ 

    this.itemList.map((a:any, index:any)=>{
      if(product.id == a.id && product.code == a.code){
        this.itemList.splice(index,1);
      }
    });

    this.wishesList.next(this.itemList);    
    localStorage.setItem('MyWhises_Cotta', JSON.stringify(this.wishesList.value));
  }

  removeAllItems(){
    this.itemList = []
    this.wishesList.next(this.itemList);
  }







  



}
