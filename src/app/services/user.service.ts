import { DatePipe } from '@angular/common';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomHttpRespone } from '../models/custom-http-response';
import { Pagination } from '../models/Pagination';
import { PaginationUser } from '../models/PaginationUser';
import { User } from '../models/User';
import { UserPaginate } from '../models/UserPaginate';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  // * Get list users
  public getUsers():  Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`)
  }
  
  // * Get list of reviews paginate
  public getAllUsersPaginate(pagination : PaginationUser):  Observable<UserPaginate> {

    const params = new HttpParams({
      fromObject: {
        pageNo: pagination.numberPage,
        pageSize: pagination.sizePage,
        names: pagination.names,
        surnames: pagination.surnames,
        username: pagination.username,
      }
    });

    return this.http.get<UserPaginate>(`${this.host}/user/paginate`,{ params: params } )
  }




  // * Add user manually
  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  // * update user manually
  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  // * Get user by username
  public getByUsername(username : string) : Observable<User> {
    return this.http.get<User>(`${this.host}/user/find/${username}`)
  }

  // * Desactivar user
  public desactivateByUsername(username: string): Observable<User> {
    return this.http.delete<User>(`${this.host}/user/desactivate-profile/${username}`);
  }

  // * Update Profile
  public updateProfile(username : string ,formData: any ) : Observable<User>  {
    return this.http.post<User>(`${this.host}/user/update-profile/${username}`, formData);
  } 

 
  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
    {reportProgress: true,
      observe: 'events'
    });
  }
  
  // Delete user
  public deleteUser(username: string): Observable<CustomHttpRespone> {
    return this.http.delete<CustomHttpRespone>(`${this.host}/user/delete/${username}`);
  }
  
  public addUsersToLocalCache(users: User[]): void{
    localStorage.setItem('users',JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {  
    if(localStorage.getItem('users')){
      return JSON.parse(localStorage.getItem('users') || '[]');
    }
    return [];
  }

  public createUserFormDate(loggedInUsername: string  | null, user: User, profileImage: any): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername!);
    formData.append('names', user.names);
    formData.append('surnames', user.surnames);
    formData.append('username', user.username);
    formData.append('role', user.role);
    formData.append('gender', user.gender);
    formData.append('dateOfBirth', new Date(user.dateOfBirth).toString());
    // formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.isActive));
    formData.append('isNonLocked', JSON.stringify(user.isNonLocked));
    return formData;
  }


  

}
