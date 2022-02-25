import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/models/Order';
import { User } from 'src/app/models/User';
import { AddressService } from 'src/app/services/address.service';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { OrderById } from 'src/app/models/OrderById';

declare var paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  public payPalConfig?: IPayPalConfig;
  public isLoadingCreate = false;
  public subscriptions: Subscription[] = [];
  public user: User | undefined;

  // ! Datos para calcular el totoal entre muchas otras cosas mas
  public products: any = [];
  public grandTotal!: number;
  public grandTotalDiscount!: number;

  // ! Datos de la dirección
  public selectAddress: any;

  public resultPayment : any;

  @ViewChild('paypal', { static: true }) paypalElement: ElementRef | undefined;

  constructor(
    private authenticationService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {

    this.isLoadingCreate = true;
    this.selectAddress = this.addressService.getAddressFromLocalCache();

    if (this.authenticationService.isUserLoggedIn()) {
      // this.initConfig();
      this.user = this.authenticationService.getUserFromLocalCache();
    }

    this.cartService.getProducts().subscribe((res) => {
      this.products = res;
      this.grandTotal = this.cartService.getTotalPrice();
      this.grandTotalDiscount = this.cartService.getTotalDiscount();
    });

    if (this.grandTotal == 0) {
      this.router.navigateByUrl('/home');
      this.createMessage('warning', 'No tienes ningún producto en tu carrito');
    }

    paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: 'Cotta Store',
                amount: {
                  currency_code: 'MXN',
                  value: this.calculateTotal(this.grandTotal),
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {

          this.isLoadingCreate = true;
          
          const order = await actions.order.capture();
          this.resultPayment = await order;
          this.createOrder({methodPayment: "Paypal", ...this.resultPayment});
        },
        onError: (err: any) => { 
          this.router.navigateByUrl('/error');
        },
      })
      .render(this.paypalElement?.nativeElement);
      
      setTimeout(() => {
        this.isLoadingCreate = false;
      }, 2500)

  }

  //  ! Calculate discount total que se ha aplicado
  public calculateDiscount(total: number, discount: number) {
    return total - discount;
  }

  // Obtener el costo del envio
  public cost() {
    let envio = 0;
    if (this.selectAddress.typeSend == '1') {
      envio = 179;
    } else {
      envio = 279;
    }
    return envio;
  }

  // ! Calcular el total mas el envio
  public calculateTotal(amount: number) {
    let envio = 0;
    if (this.selectAddress.typeSend == '1') {
      envio = 179;
    } else {
      envio = 279;
    }
    return amount + envio;
  }

  // Create order
  public createOrder(d : any): void {


    let listProducts = this.products.map((x : any, key : any) => {
      return {
        cantd: x.cantidad,
        code: x.code,
        discount: x.discount,
        name: x.name,
        price: x.priceR,
        productId: x.id,
        size: x.size,
      }
    });
    
    

    let data = {
      address: {
        calle: this.selectAddress.calle,
        colonia: this.selectAddress.colonia,
        cp: this.selectAddress.cp,
        details: this.selectAddress.moreInformation,
        email: this.selectAddress.email,
        names: this.selectAddress.names,
        noExterior: this.selectAddress.noExternal,
        noInterior: this.selectAddress.noInternal,
        phone: this.selectAddress.phone,
        surnames: this.selectAddress.surnames,
        state: this.selectAddress.state,
        town: this.selectAddress.city,
        typeSend: this.selectAddress.typeSend,
        userId: this.user?.id,
      },
      list: listProducts,
      order: {
        methodPayment: d.methodPayment,
        reference: d.id,
        discount: this.calculateDiscount(this.grandTotalDiscount,this.grandTotal),
        statusReference: d.status,
        subtotal: this.grandTotalDiscount,
        total: this.calculateTotal(this.grandTotal),
        typeSend: this.selectAddress.typeSend,
        userId: this.user?.id,
      },
    };

    console.log(data);

    this.subscriptions.push(
      this.orderService.createOrder(data).subscribe(
        (response: OrderById) => {
          
          this.message.create(
            'success',
            'Tu orden se genero de manera correcta'
          );

          
          setTimeout(() => {
            this.cartService.removeAllCart();
            this.isLoadingCreate = false;
            this.router.navigateByUrl('/success');
            }, 3000)

        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingCreate = false;
          this.message.create('error', 'Ha ocurrido un error!');
        }
      )
    );
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'MXN',
      clientId:
        'AakILISfnWYBR4jFCfkqvtAgS_94wWo98Noc6i3Tkl6LpWjTDlUxMEOBcF_fnmCF6ePTRaCiJ37SUawe',
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'MXN',
                value: '1999.99',
                breakdown: {
                  item_total: {
                    currency_code: 'MXN',
                    value: '1999.99',
                  },
                },
              },
              items: [
                {
                  name: 'Enterprise Subscription',
                  quantity: '1',
                  category: 'DIGITAL_GOODS',
                  unit_amount: {
                    currency_code: 'MXN',
                    value: '1999.99',
                  },
                },
              ],
            },
          ],
        },
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => {
        console.log(
          'onApprove - transaction was approved, but not authorized',
          data,
          actions
        );
        alert('En proceso');

        actions.order.get().then((details: any) => {
          console.log(
            'onApprove - you can get full order details inside onApprove: ',
            details
          );
          alert('Se encuentra aprobada');
        });
      },
      onClientAuthorization: (data) => {
        console.log(
          'onClientAuthorization - you should probably inform your server about completed transaction at this point',
          data
        );
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: (err) => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }

  createNotification(type: string, message: string): void {
    this.notification.create(type, 'Excelente!', `${message} 😀`, {
      nzPlacement: 'bottomLeft',
    });
  }

  createMessage(type: string, message: string): void {
    this.message.create(type, message);
  }



}
