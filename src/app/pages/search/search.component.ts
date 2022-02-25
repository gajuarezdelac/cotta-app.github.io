import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { min } from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { ProductPaginate, Content } from 'src/app/models/ProductPaginate';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { SearchService } from 'src/app/services/search.service';
import { WishesService } from 'src/app/services/wishes.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {


  // Variables para obtener el listado de productos
  public pageSize: number = 6;
  public current: number = 1;
  public subscriptions: Subscription[] = [];
  public products : Content[] = [];
  public temp : Content[] = [];
  public total: number = 0;
  public totalElementByPage = 0;
  public isLoadingTable = false;
  public filterForm! : FormGroup;
  public key : any = {};

  //   
  constructor(
    private authenticationService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private searchService: SearchService,
    private wishService : WishesService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {

    this.searchService.getKeyword()
    .subscribe(res=>{

     if(this.current >= 1) {
      this.current = 1;
     }

      this.key = res;
      console.log(res);
      res.keyword ? res.keyword = res.keyword : res.keyword = "";
      res.typeClothing ? res.typeClothing = res.typeClothing : res.typeClothing = "";
      res.category ? res.category = res.category : res.category = "N";
      res.clasification ? res.clasification = res.clasification : res.clasification = "";
      this.resetFilter();
      this.getListPaginate();
    });
    

    this.filterForm = this.fb.group({
      category: [''],
      clasification: [''],
      typeClothing: [''],
      minPrice: [0],
      maxPrice: [10000],
    });
  }

  
  get f() { return this.filterForm.controls; }

  // ! Listado de registros para llenar la tabla 
  getListPaginate() : void {
    this.isLoadingTable = true;
    this.subscriptions.push(
      this.productService.searchProducts({ numberPage: (this.current - 1), sizePage: this.pageSize, keyword: this.key.keyword,typeClothing: this.key.typeClothing != undefined ?  this.key.typeClothing : this.filterForm.value["typeClothing"], clasification: this.key.clasification =! undefined ? this.key.clasification : this.filterForm.value["clasification"],category:  this.key.category == 'N' ? "" : this.filterForm.value["category"], minPrice: this.filterForm.value["minPrice"], maxPrice: this.filterForm.value["maxPrice"]}).subscribe(
        (response: ProductPaginate) => {
          this.temp = response.content;
          this.products = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
          this.onActivate();
          this.isLoadingTable = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingTable = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  changePageSize($event: number) : void {
    console.log("Change page size: "  + $event);
    this.pageSize = $event;
    this.getListPaginate();
  }

   changeCurrentPage($event: number) : void {
    this.current = $event;
    this.getListPaginate();
   }

   public filterSubmit() {

    this.isLoadingTable = true;    
    if(this.filterForm.value.minPrice < 0) {
      this.createNotification('warning', 'El valor minimo no puede ser 0');
      this.isLoadingTable = false;
      return;
    }

    if(this.filterForm.value.maxPrice < this.filterForm.value.minPrice) {
      this.createNotification('warning', 'El valor max no pueder ser menor al minimo');
      this.isLoadingTable = false;
      return;
    }

    if(this.current >= 1) {
      this.current = 1;
    }

    // Key clear
    this.key.typeClothing = undefined;
    this.key.category = undefined;
    this.key.clasification = undefined;

    this.subscriptions.push(
      this.productService.searchProducts({ numberPage: (this.current - 1), sizePage: this.pageSize, keyword: this.key.keyword ,typeClothing: this.filterForm.value.typeClothing, clasification: this.filterForm.value.clasification,category:  this.filterForm.value.category, minPrice:  this.filterForm.value.minPrice, maxPrice: this.filterForm.value.maxPrice }).subscribe(
        (response: ProductPaginate) => {
          this.temp = response.content;
          this.products = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
          this.onActivate();
          this.isLoadingTable = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingTable = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );

   }

  

  private resetFilter() {
    this.filterForm = this.fb.group({
      category: [''],
      clasification: [''],
      typeClothing: [''],
      minPrice: [0],
      maxPrice: [10000],
    });
  }

  // ! Calcular el precio total
  calculatePrice(price :  any, discount : any) {
    let r = price * (discount / 100);
    return price - r;
  }
  
  
  //  ! Agregar a favoritos
  addFavoritos(item: any) : void {
    this.wishService.addtoWishes(item);
    this.createNotificationF('success', "Se ha añadido a tu lista");
  }

  onActivate() {
    window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
     }); 
  }

  
  createNotification(type: string, message: string): void {
    this.notification.create(
      type,
      'Upps!',
      `${message} 😞`,
      { nzPlacement: 'bottomLeft' }
    );
  }

  
  createNotificationF(type: string, message: string): void {
    this.notification.create(
      type,
      'Upps!',
      `${message} 😍`,
      { nzPlacement: 'bottomLeft' }
    );
  }


  
  public resetSearch() {
    this.search({keyword: "", typeClothing: "", clasification: ""} );
    this.router.navigate(['/search']);
  }
  
  search(keyword: any){
    this.searchService.search(keyword);
  }









}
