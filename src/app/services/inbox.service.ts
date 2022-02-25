import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Inbox, Content } from '../models/Inbox';
import { Pagination } from '../models/Pagination';
import { PaginationInbox } from '../models/PaginationInbox';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
    
  
  public host  = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  // * Get list of inbox
  public getAllMessages():  Observable<Content[]> {
    return this.http.get<Content[]>(`${this.host}/inbox/list`)
  }

  
  // * Get list of inbox
  public getAllMessagesPaginate(pagination : PaginationInbox):  Observable<Inbox> {

    const params = new HttpParams({
      fromObject: {
        pageNo: pagination.numberPage,
        pageSize: pagination.sizePage,
        subject: pagination.subject,
        content: pagination.content,
        email: pagination.email
      }
    });

    return this.http.get<Inbox>(`${this.host}/inbox/paginate`,{ params: params } )
  }
  
  // * Get inbox by ID
  public getMessageById(id : string) : Observable<Content> {
      return this.http.get<Content>(`${this.host}/inbox/view/${id}`)
  }
   
  // * Agregar inbox
  public sendMessage(formData: any): Observable<Content> {
      return this.http.post<Content>(`${this.host}/inbox/contact`, formData);
  }

  // * Delete inbox
  public deleteMessage(id: string): Observable<Content> {
    return this.http.delete<Content>(`${this.host}/inbox/delete/${id}`);
  }

}
