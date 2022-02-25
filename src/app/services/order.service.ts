import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../models/Order';
import { OrderById } from '../models/OrderById';
import { OrderPaginate } from '../models/OrderPaginate';
import { Pagination } from '../models/Pagination';
import { PaginationOrder } from '../models/PaginationOrder';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  public host  = environment.apiUrl;

  constructor(private http: HttpClient) { }

   // * Get list of inbox
   public getAllOrders():  Observable<Order[]> {
    return this.http.get<Order[]>(`${this.host}/order/list`)
  }
  
  
  // * Get list of inbox
  public getAllOrdersPaginate(pagination : PaginationOrder):  Observable<OrderPaginate> {

    const params = new HttpParams({
      fromObject: {
        pageNo: pagination.numberPage,
        pageSize: pagination.sizePage,
        id: pagination.id,
        userId: pagination.userId,
        dateBegin: pagination.dateBegin,
        dateFinish: pagination.dateFinish
      }
    });

    return this.http.get<OrderPaginate>(`${this.host}/order/paginate`,{ params: params } )
  }

   // * Get list of inbox
   public getOrdersByUser(userId : string):  Observable<OrderById[]> {
    return this.http.get<OrderById[]>(`${this.host}/order/list`)
   }
  
  // * Get inbox by ID
  public getOrderById(id : string) : Observable<OrderById> {
      return this.http.get<OrderById>(`${this.host}/order/${id}`)
  }

  // * Crear orden
  public createOrder(formData: any): Observable<OrderById> {
    return this.http.post<OrderById>(`${this.host}/order/create`, formData);
  }

  // * Crear orden
  public changeStatus(formData: any): Observable<OrderById> {
    return this.http.put<OrderById>(`${this.host}/order/change-status`, formData);
  }
  
  // * Delete inbox
  public deleteOrder(id: string): Observable<OrderById> {
    return this.http.delete<OrderById>(`${this.host}/order/${id}`);
  }

















}
