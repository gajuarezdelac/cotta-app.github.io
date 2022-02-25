import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  
  public user: User | undefined;
  public validateForm!: FormGroup;
  public submitted: boolean = false;
  public totalItem : number = 0;

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private searchService : SearchService,
    private router: Router,
    private cartService : CartService
  ) { }

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      keyword: [null]
    });

    if(this.authenticationService.isUserLoggedIn()) {
      this.user = this.authenticationService.getUserFromLocalCache();
    }

    // Cada vez que cargue la pantalla principal se asignara se rellenara las variables
    this.cartService.setProduct(JSON.parse(localStorage.getItem('MyCart_Cotta') || '[]'));
    
    this.cartService.getProducts()
    .subscribe(res=>{
      this.totalItem = res.length;
    })

  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.user = undefined;
    this.message.create("success",  "Sesión cerrada de manera correcta!");
  }

  onActivate(event : any) {
    // window.scroll(0,0);
 
    window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
     });     
  }

  public onSubmit(): void {
    this.submitted = true;
    if(this.validateForm.value.keyword == null || this.validateForm.value.keyword == '') {       
      this.search({keyword: "", typeClothing: ""});
      this.router.navigate(['/search']);
    } else {
      this.search( {keyword: this.validateForm.value.keyword, typeClothing: ""} );
      this.router.navigate(['/search']);
    }   
  }

  public searchByCategory(key: string, gender: string) {
    this.search({keyword: "", typeClothing: key, clasification: gender} );
    this.router.navigate(['/search']);
  }
  
  search(keyword: any){
    this.searchService.search(keyword);
  }

}
