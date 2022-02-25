import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/Product';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { SearchService } from 'src/app/services/search.service';
import { WishesService } from 'src/app/services/wishes.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  public products : any = [];
  public user : User | undefined;
  public isLoadingView = false;
  public lstProducts : Product[] = [];
  public subscriptions : Subscription[] = [];
  

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private productService: ProductService,
    private wishService : WishesService,
    private searchService : SearchService,
    private notification: NzNotificationService
    ) { }

  ngOnInit(): void {

    if(this.authenticationService.isUserLoggedIn()) {
      this.user = this.authenticationService.getUserFromLocalCache();
    }
    
    this.wishService.setProduct(JSON.parse(localStorage.getItem('MyWhises_Cotta') || '[]'));
    
    this.wishService.getWhishes()
    .subscribe(res=>{
      this.products = res;
      this.getProductsByIds(this.products);
    });
    
  }

  // Get all favorites
  public getProductsByIds(lst : any) {


    let newLst : any[] = [];
    lst.forEach((product : any) => { newLst.push(product.id);});


    this.subscriptions.push(
      this.productService.getAllProductsById(newLst).subscribe(
        (response: Product[]) => {
          this.isLoadingView = false;
          this.lstProducts = response;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingView = false;
          this.message.create("error",  errorResponse.error.message);
        }
      )
    );
  }

   
  isNull(e : any) : string {
    if(e == '' || e == undefined){
      return 'Sin número'
    }
    return e;
  }



  getInitials() {
    
    let text = this.user?.names + ' ' + this.user?.surnames;
    let names = text?.split(' '),
        initials = names![0].substring(0, 1).toUpperCase();
    
    if (names!.length > 1) {
        initials += names![names.length - 1].substring(0, 1).toUpperCase();
    }

    return initials;
};


  // delete favorite
  public deleteFavorite(item : any) {
    this.wishService.removeItem(item);
    this.createNotificationF('success', "Se a eliminado correctamente");
  }

  public navigate() {
    this.searchService.search({keyword: "", typeClothing: ""});
    this.router.navigate(['/search']);
  }
  
  calculatePrice(price :  any, discount : any) {
    let r = price * (discount / 100);
    return price - r;
  }



  createNotificationF(type: string, message: string): void {
    this.notification.create(
      type,
      'Aviso',
      `${message}`,
      { nzPlacement: 'bottomLeft' }
    );
  }










}
