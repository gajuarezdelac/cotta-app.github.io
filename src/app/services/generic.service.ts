import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Generic } from '../models/Generic';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  public host  = environment.apiUrl;

  constructor(private http: HttpClient) { }

   // * Get list of states
  public getAllOrders():  Observable<Generic[]> {
    return this.http.get<Generic[]>(`${this.host}/generic/list-states`)
  }

  
   // * Get all citiies by key
   public getAllCitiesByKey(key: string):  Observable<Generic[]> {
    return this.http.get<Generic[]>(`${this.host}/generic/cities/${key}`)
  }




}
