import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-shop-cart',
  templateUrl: './shop-cart.component.html',
  styleUrls: ['./shop-cart.component.css']
})
export class ShopCartComponent implements OnInit {

  
  public products : any = [];
  public grandTotal !: number;


  constructor(
    private authenticationService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private productService: ProductService,
    private searchService : SearchService,
    private cartService: CartService,
    private notification: NzNotificationService
    ) { }

  ngOnInit(): void {

    this.cartService.getProducts()
    .subscribe(res=>{
      this.products = res;
      this.grandTotal = this.cartService.getTotalPrice();
    });
    
  }

  removeItem(item: any){
    this.cartService.removeCartItem(item);
  }

  emptycart(){
    this.cartService.removeAllCart();
  }

  
  calculatePrice(price :  any, discount : any) {
    let r = price * (discount / 100);
    return price - r;
  }


  onChangeCant(event : any, item: any) {
    console.log(event);
    console.log(item);
  }
  

  
  public navigate() {
    this.searchService.search({keyword: "", typeClothing: ""});
    this.router.navigate(['/search']);
  }
  

}
