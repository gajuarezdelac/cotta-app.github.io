import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RecoveryPasswordComponent } from './pages/auth/recovery-password/recovery-password.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetailOrderComponent } from './pages/detail-order/detail-order.component';
import { DetailsProductComponent } from './pages/details-product/details-product.component';
import { FaqComponent } from './pages/faq/faq.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { FinanceControlComponent } from './pages/finance-control/finance-control.component';
import { FormShopComponent } from './pages/form-shop/form-shop.component';
import { HomeComponent } from './pages/home/home.component';
import { InboxControlComponent } from './pages/inbox-control/inbox-control.component';
import { OrdersControlComponent } from './pages/orders-control/orders-control.component';
import { PaymentErrorComponent } from './pages/payment-error/payment-error.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ProductControlComponent } from './pages/product-control/product-control.component';
import { ReviewsControlComponent } from './pages/reviews-control/reviews-control.component';
import { SearchComponent } from './pages/search/search.component';
import { ShopCartComponent } from './pages/shop-cart/shop-cart.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UsersComponent } from './pages/users/users.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';

const routes: Routes = [
  { path: 'dashboard', component: WelcomeComponent, children: [
     { path: "statistics", component: DashboardComponent },
     { path: "products", component: ProductControlComponent },
     { path: "users", component: UsersComponent },
     { path: "orders", component: OrdersControlComponent },
     { path: "reviews", component: ReviewsControlComponent },
     { path: "inbox", component: InboxControlComponent },
     { path: "finance", component: FinanceControlComponent },
     { path: 'dashboard', pathMatch: 'full', redirectTo: '/statistics' },
    ],
  canActivate: [ AuthGuard ]
  },
  {path: 'auth', component: AuthComponent, children : [
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "recovery-password", component: RecoveryPasswordComponent },
    { path: "reset-password/:token/:email", component: ResetPasswordComponent },
    { path: 'auth', pathMatch: 'full', redirectTo: '/login' },
  ]},
  {path: '', component: NavbarComponent, children : [
    {path: 'home', component: HomeComponent },
    {path: 'search', component: SearchComponent },
    {path: 'product/:id', component: DetailsProductComponent },
    { path: 'my-cart' , component: ShopCartComponent },
    { path: 'my-profile' , component: UserProfileComponent, canActivate: [ AuthGuard ] },
    { path: 'success' , component: PaymentSuccessComponent, canActivate: [ AuthGuard ] },
    { path: 'error' , component: PaymentErrorComponent, canActivate: [ AuthGuard ] },
    { path: "faq",  component: FaqComponent },
    { path: "order/:id", component: DetailOrderComponent, canActivate: [ AuthGuard ] },
    { path: 'check-delivery', component: FormShopComponent, canActivate: [ AuthGuard ] },
    { path: 'payment', component: PaymentComponent , canActivate: [ AuthGuard ]},
    { path: 'favorites', component: FavoritesComponent , canActivate: [ AuthGuard ]},
    { path: '', pathMatch: 'full', redirectTo: '/home' },
  ]},
  {path: '**', redirectTo: '',  pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
