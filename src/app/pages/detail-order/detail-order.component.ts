import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/models/Order';
import { Address, OrderById, ProductByOrder, UserOrder } from 'src/app/models/OrderById';
import { Product } from 'src/app/models/Product';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-detail-order',
  templateUrl: './detail-order.component.html',
  styleUrls: ['./detail-order.component.css']
})
export class DetailOrderComponent implements OnInit {


  public orderId : string = "";
  public isLoadingView = false;
  
  public element! : OrderById;
  public productsByOrder : ProductByOrder[] = [];
  public address! : Address;
  public userOrder! : UserOrder;

  public lstProducts : Product[] = [];
  public subscriptions : Subscription[] = [];
  
  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService,
    private  notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.orderId = this.actRoute.snapshot.params.id;
    this.getOrderById(this.actRoute.snapshot.params.id); 
  }

  public getOrderById(id :  string) {
    this.isLoadingView = true;
    this.subscriptions.push(
      this.orderService.getOrderById(id).subscribe(
        (response: OrderById) => {
          this.isLoadingView = false;
          this.element = response;
          this.userOrder = response.user;
          this.address = response.address;
          this.productsByOrder = response.products;
          console.log(response);
          
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingView = false;
          this.message.create("error",  errorResponse.error.message);
          this.router.navigateByUrl('/my-profile');
        }
      )
    );
  }

   //  ! Calculate discount total que se ha aplicado
   public calculateDiscount() {
    return this.element.subtotal - this.element.discount;
  }

  // Obtener el costo del envio
  public cost() {
    let envio = 0;
    if (this.element.address.typeSend == '1') {
      envio = 179;
    } else {
      envio = 279;
    }
    return envio;
  }

  // ! Calcular el total mas el envio
  public calculateTotal(amount: number) {
    let envio = 0;
    if (this.element.address.typeSend == '1') {
      envio = 179;
    } else {
      envio = 279;
    }
    return amount + envio;
  }

  // public getProductsByIds(lst : string[]) {
  //   this.subscriptions.push(
  //     this.productService.getAllProductsById(lst).subscribe(
  //       (response: Product[]) => {
  //         this.isLoadingView = false;
  //         this.lstProducts = response;
  //       },
  //       (errorResponse: HttpErrorResponse) => {
  //         this.isLoadingView = false;
  //         this.message.create("error",  errorResponse.error.message);
  //       }
  //     )
  //   );
  // }


  

}
