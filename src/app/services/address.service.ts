import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Address } from '../models/Address';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  

  public host  = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public removeAddress(): void  {
    localStorage.removeItem("addressCotta_send");
  }

  public addAddressToLocalStorage(data: any) {
   localStorage.setItem('addressCotta_send', JSON.stringify(data));
  }
  
  public getAddressFromLocalCache() : Address {
    // Sintaxis para campos que pueden venir vacios
    return JSON.parse(localStorage.getItem('addressCotta_send') || '{}');
   }


  // * Get all orders By users
  public getAllReviews(userId : string):  Observable<Address[]> {
       return this.http.get<Address[]>(`${this.host}/address/list/${userId}`)
  }

  // * Get dirección by ID
  public getReviewById(id : string) : Observable<Address> {
      return this.http.get<Address>(`${this.host}/address/view/${id}`)
  }

  // * Crear dirección
  public createReview(formData: any): Observable<Address> {
    return this.http.post<Address>(`${this.host}/address/add`, formData);
  }

  // * Actualizar dirección
  public updateReview(formData: any): Observable<Address> {
    return this.http.put<Address>(`${this.host}/address/update`, formData);
  }
  
  // * Eliminar dirección
  public deleteReview(id: string): Observable<Address> {
    return this.http.delete<Address>(`${this.host}/address/delete/${id}`);
  }




}
