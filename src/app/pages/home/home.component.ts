import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/Product';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public user: User | undefined;
  public submitted: boolean = false;
  public subscriptions: Subscription[] = [];


  // Top rating
  public products: Product[] = [];
  public isLoadingView: boolean = false;



  constructor(
    private authenticationService : AuthService,
    private productService : ProductService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router) { }

  ngOnInit(): void {

    if(this.authenticationService.isUserLoggedIn()) {
      this.user = this.authenticationService.getUserFromLocalCache();
    }

    this.getProductsByRating();

  }

   public navigate(e : any) : void {
    this.router.navigate(['/search'], { queryParams: { keyword: e } });
   }


   public viewDetails(e : any) : void {
    this.router.navigate(['/product/e']);
   }


   // Get products by promotion

   public getProductsByRating() {

    this.isLoadingView = true;
    
    this.subscriptions.push(
      this.productService.getAllProductsTopRating().subscribe(
        (response: Product[]) => {
          this.products = response;
          this.isLoadingView = false;
          
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingView = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
   }




}
