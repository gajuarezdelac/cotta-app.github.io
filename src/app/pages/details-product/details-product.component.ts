import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs/internal/Subscription';
import { Product, Image } from 'src/app/models/Product';
import { Content } from 'src/app/models/Review';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.css']
})
export class DetailsProductComponent implements OnInit {

  // Variables para visualizar el producto
  public subscriptions : Subscription[] = [];
  public element : Product = new Product();
  public isLoadingView = false;
  public isLoadingReview = false;
  public idProduct : String = "";
  public images : Image[] = [];

  // Reviews
  public lstReviews : Content[] = [];
  public totalReviews : number = 0;
  public isLoadingGetReviews = false;

  // Agregar review
  public createForm! : FormGroup;
  @ViewChild('f') myForm: NgForm | undefined;
  public isVisibleAdd : boolean = false;
  public cantidad = 0;

  // Editar review
  public createProduct! : FormGroup;

  // Obtener las tallas disponibles
  public isLoadingSizes = false;
  public lstSizes : any = [];
  public sizeSelect : any;

  // Obtener la cantidad disponible basado en código de producto, size and id
  public cantdMax : any = null;
  public elementBySize : Product  = new Product();

  public placeholder : string = "Selecciona una talla";

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private  notification: NzNotificationService
  ) { }

   ngOnInit(): void {
     
    this.createProduct = this.fb.group({
      size: [null, Validators.required],
      extra: [null, Validators.required],
      cantd: [1, Validators.required],
    });

    this.idProduct = this.actRoute.snapshot.params.id;
    this.getElementById(this.actRoute.snapshot.params.id);
    this.createForm = this.fb.group({
      calf: [5, Validators.required],
      message: ["", Validators.required],
      title: ["", Validators.required],
    });


   }

  // Get Product
  getElementById(id : string) : void {
    this.isLoadingView = true;
    this.subscriptions.push(
      this.productService.getProductById(id).subscribe(
        (response: Product) => {
          
          this.images = response.images.slice(1);
          this.element = response;
          this.getSizesByCode(response.code);
          this.getAllReviews();
          this.isLoadingView = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingView = false;
          this.message.create("error",  errorResponse.error.message);
          this.router.navigateByUrl('/home');
        }
      )
    );
  }

  // Get all reviews by code
  public getAllReviews() : void {
    this.isLoadingGetReviews = true;
    this.subscriptions.push(
      this.reviewService.getAllReviewsByProduct(this.element.code).subscribe(
        (response: Content[]) => {
          this.lstReviews = response;
          this.totalReviews = response.length;
          this.isLoadingGetReviews = false;

        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingGetReviews = false;
          this.message.create("error",  errorResponse.error.message);
        }
      )
    );
  }

  // Add new review
  public createSubmit() : void {

    
    for (const i in this.createForm.controls) {
      if (this.createForm.controls.hasOwnProperty(i)) {
        this.createForm.controls[i].markAsDirty();
        this.createForm.controls[i].updateValueAndValidity();
      }
    }


    if(!this.createForm.valid) {
      return ; 
    }

    
    this.isLoadingReview = true;
    let form = this.createForm.value;
    // const formData = this.reviewService.createFormReview('', {userId: "Usuario de prueba", codeProd: this.element.code , ...form}); 

    this.subscriptions.push(
      this.reviewService.createReview({userId: "Usuario de prueba", codeProd: this.element.code , ...form}).subscribe(
        (response: Content) => {
          this.message.create("success",  "Se ha creado correctamente!");
          this.isLoadingReview = false;
          this.getAllReviews();
          this.handleCancel();
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingReview = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  handleCancel() {
    this.isVisibleAdd = false;
  }

  showModalAddModal() {
    this.isVisibleAdd = true;
  }

  public validateForm() : void {    
    for (const i in this.createProduct.controls) {
      if (this.createProduct.controls.hasOwnProperty(i)) {
        this.createProduct.controls[i].markAsDirty();
        this.createProduct.controls[i].updateValueAndValidity();
      }
    }

    if(!this.createProduct.valid) {
      return; 
    }
    
    let form = this.createProduct.value;
    this.addtocart({ cantidad: form.cantd, talla: form.size, extra: form.extra, priceR: this.calculatePrice(this.elementBySize.price, this.elementBySize.discount) ,...this.elementBySize  });

  }
 
  // Delete review by user

  public deleteReviewByUSer() : void {

    this.isLoadingReview = true;
    if(!this.createForm.valid) {
      return ; 
    }

    let form = this.createForm.value;
    const formData = this.productService.createFormDate('', form); 

    this.subscriptions.push(
      this.reviewService.createReview(form).subscribe(
        (response: Content) => {
          this.message.create("success",  "Ha ocurrido un error!");
          this.isLoadingReview = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingReview = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  getSizesByCode(code : string) {
    this.isLoadingSizes = true;
    this.subscriptions.push(
      this.productService.getProductsByCode(code).subscribe(
        (response: Product[]) => {          
          this.lstSizes = response;
          this.isLoadingSizes = false;
          this.getAllReviews();
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingSizes = false;
          this.message.create("error",  errorResponse.error.message);
        }
      )
    );
  }

  onChangeSize($event : any) {
    this.cantidad = 1;
    this.elementBySize = new Product();
    this.getCantByCodeAndSize(this.element.code,$event);
  }

  getCantByCodeAndSize(code : string, size : string) {
    this.isLoadingSizes = true;
    this.subscriptions.push(
      this.productService.getProductByCodeAndSize(code, size).subscribe(
        (response: Product) => {          
          this.elementBySize = response;
          this.isLoadingSizes = false;
          this.getAllReviews();
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingSizes = false;
          this.message.create("error",  errorResponse.error.message);
        }
      )
    );
  }




  getReviewsByRate(rate : number) {
    let r = 0;
    r =  (this.lstReviews.filter(e => e.calf == rate).length * 100) / this.totalReviews;

    if(isNaN(r)) {
      r = 0;
    } 

    return `${r.toFixed(0)}%`;
  }

  calcullateRating()  {
    let totalCalf = 0;
    this.lstReviews.forEach((e) => {
      totalCalf += e.calf;
    });
    let r = totalCalf / this.lstReviews.length;
    return r;
  }

  
  calculatePrice(price :  any, discount : any) {
    let r = price * (discount / 100);
    return price - r;
  }

  
  sumOne() {
    if(this.cantidad >= 0 && this.elementBySize?.cantd > this.cantidad) {
      this.cantidad += 1;   
    }else {
      return;
    }
  }

  lessOne() {
    if(this.cantidad <= 1) {
      return;
    }else {
      this.cantidad -= 1;
    }
  }

  // ! Add cart
  addtocart(item: any){
    this.cartService.addtoCart(item);
    this.createNotification('success', item);
  }
 
  createNotification(type: string, element : any): void {
    this.notification.create(
      type,
      'Agregado exitosamente',
      `Se ha agregado ${element.cantidad} piezas a nuestro carrito 😀`,
      { nzPlacement: 'bottomLeft' }
    );
  }


}
