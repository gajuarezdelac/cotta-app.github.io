import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cartItemList : any = []
  public productList = new BehaviorSubject<any>([]);  

  constructor() { }

  getProducts(){
    return this.productList.asObservable();
  }

  setProduct(product : any){
    this.cartItemList = [];
    this.cartItemList.push(...product);
    this.productList.next(this.cartItemList);
  }
  
  addtoCart(product : any){
    this.cartItemList = this.updateWishes(product);
    this.productList.next(this.cartItemList);
    localStorage.setItem('MyCart_Cotta', JSON.stringify(this.productList.value));
    this.getTotalPrice();
    this.getTotalDiscount();
  }

  updateWishes(product : any){
    // En caso de que exista un producto con las mismas caracteristicas este se elimina
    this.cartItemList.map((a:any, index:any)=>{
      console.log(a);
      if(product.id == a.id && product.talla == a.talla && product.code == a.code){
        this.cartItemList.splice(index,1);
      }
    });

    // Se inserta el nuevo independientemente si existe o no
    this.cartItemList.push(product);
    return this.cartItemList;
  }


  getTotalPrice() : number{
    let grandTotal = 0;

    this.cartItemList.map((a:any)=>{
      grandTotal += a.priceR * a.cantidad;
    })
    return grandTotal;
  }

  getTotalDiscount() : number{

    let grandTotal = 0;
    this.cartItemList.map((a:any)=>{
      grandTotal += a.price * a.cantidad;
    })
    return grandTotal;

  }

  removeCartItem(product: any){
    
    this.cartItemList.map((a:any, index:any)=>{
      if(product.id == a.id && product.talla == a.talla && product.code == a.code){
        this.cartItemList.splice(index,1);
      }
    });

    this.productList.next(this.cartItemList);    
    localStorage.setItem('MyCart_Cotta', JSON.stringify(this.productList.value));

  }

  removeAllCart(){
    this.cartItemList = []
    this.productList.next(this.cartItemList);
  }




}
