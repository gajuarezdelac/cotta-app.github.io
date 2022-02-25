import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Pagination } from '../models/Pagination';
import { PaginationProduct } from '../models/PaginationProduct';
import { PaginationSearch } from '../models/PaginationSearch';
import { Product } from '../models/Product';
import { ProductPaginate } from '../models/ProductPaginate';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public host  = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
   // * Get all products
  public getAllProducts():  Observable<Product[]> {
    return this.http.get<Product[]>(`${this.host}/product/list`)
  }

  // * Search products
  public searchProducts(pagination : PaginationSearch) :  Observable<ProductPaginate> {

    const params = new HttpParams({
      fromObject: {
        typeClothing: pagination.typeClothing,
        clasification: pagination.clasification,// Sexo de la persona
        category: pagination.category, 
        keyWord: pagination.keyword,
        pageNo: pagination.numberPage,
        minPrice: pagination.minPrice,
        maxPrice: pagination.maxPrice,
        pageSize: pagination.sizePage
      }
    });

    return this.http.get<ProductPaginate>(`${this.host}/product/search`, {params: params})
  } 

  // * Get list of inbox
  public getAllProductsPaginate(pagination : PaginationProduct):  Observable<ProductPaginate> {

    const params = new HttpParams({
      fromObject: {
        pageNo: pagination.numberPage,
        pageSize: pagination.sizePage,
        codeProd: pagination.codeProd,
        description: pagination.description,
        name: pagination.name,
        category: pagination.category
      }
    });

    return this.http.get<ProductPaginate>(`${this.host}/product/paginate`,{ params: params } )
  }


  // * Buscar listado de productos por código
  public getProductByCode(code : string):  Observable<Product> {
    return this.http.get<Product>(`${this.host}/product/code/${code}`)
  }

  // * Get all products by code
  public getProductsByCode(code : string):  Observable<Product[]> {
    return this.http.get<Product[]>(`${this.host}/product/list-code/${code}`)
  }
 
  
  public getProductByCodeAndSize(code : string, size : string) :   Observable<Product> {
    return this.http.get<Product>(`${this.host}/product/code-size/${code}/${size}`)
  }

  // * Buscar listado top rating
  public getAllProductsTopRating():  Observable<Product[]> {
    return this.http.get<Product[]>(`${this.host}/product/list-top`)
  }


  // * List of products by ID´s
  public getAllProductsById(list : any) : Observable<Product[]> {
    return this.http.post<Product[]>(`${this.host}/product/list-id`, list)
  }

  // * Get product by ID
  public getProductById(id : string) : Observable<Product> {
      return this.http.get<Product>(`${this.host}/product/view/${id}`)
  }

   // * Crear producto
   public createProduct(formData: any): Observable<Product> {
    return this.http.post<Product>(`${this.host}/product/add`, formData);
  }

  // * Actualizar producto por ID
  public updateProduct( formData: any): Observable<Product> {
    return this.http.put<Product>(`${this.host}/product/update`, formData);
  }
  
  // * Eliminar review
  public deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.host}/product/${id}`);
  }

  
  public createFormDate(currentElement: string  | null, element: Product): FormData {
    const formData = new FormData();
    formData.append('id', currentElement!);
    formData.append('codeProd', element.code);
    formData.append('name', element.name);
    formData.append('description', element.shortDescription);
    formData.append('cant', element.cantd);
    formData.append('price', element.price);
    formData.append('discount', element.discount);
    formData.append('category', element.category);
    formData.append('typeGarment', element.typeGarment);
    formData.append('typeClothing', element.typeClothing);
    formData.append('size', element.size);
    return formData;
  }



}
