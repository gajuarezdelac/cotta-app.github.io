import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginationReview } from '../models/PaginationReview';
import { Review, Content } from '../models/Review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  
  public host  = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // * Get all reviews
  public getAllReviews():  Observable<Content[]> {
    return this.http.get<Content[]>(`${this.host}/review/list`)
  }


  // * Get list of reviews paginate
  public getAllReviewsPaginate(pagination : PaginationReview):  Observable<Review> {

    const params = new HttpParams({
      fromObject: {
        pageNo: pagination.numberPage,
        pageSize: pagination.sizePage,
        codeProd: pagination.codeProd,
        message: pagination.message,
        userId: pagination.userId
      }
    });

    return this.http.get<Review>(`${this.host}/review/paginate`,{ params: params } )
  }

  // * Get all reviews by product
  public getAllReviewsByProduct(code : string):  Observable<Content[]> {
    return this.http.get<Content[]>(`${this.host}/review/product/${code}`)
  }

  // * Get review by ID
  public getReviewById(id : string) : Observable<Content> {
      return this.http.get<Content>(`${this.host}/review/${id}`)
  }

   // * Crear review
   public createReview(formData: any): Observable<Content> {
    return this.http.post<Content>(`${this.host}/review/create`, formData);
  }

  // * Actualizar review
  public updateReview(formData: any): Observable<Content> {
    return this.http.put<Content>(`${this.host}/review/update`, formData);
  }
  
  // * Eliminar review
  public deleteReview(id: string): Observable<Content> {
    return this.http.delete<Content>(`${this.host}/review/${id}`);
  }

    
  public createFormReview(currentElement: string  | null, element: any): FormData {
    const formData = new FormData();
    formData.append('id', currentElement!);
    formData.append('codeProd', element.codeProd);
    formData.append('userId', element.userId);
    formData.append('calf', element.calf);
    formData.append('message', element.message);
    formData.append('title', element.title);
    return formData;
  }


}
