import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from 'src/app/services/auth.service';
import { ReviewService } from 'src/app/services/review.service';
import * as XLSX from 'xlsx';
import { Content, Review } from 'src/app/models/Review';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reviews-control',
  templateUrl: './reviews-control.component.html',
  styleUrls: ['./reviews-control.component.css']
})
export class ReviewsControlComponent implements OnInit {


  // * Variables de la tabla
  public pageSize: number = 10;
  public current: number = 1;
  public subscriptions : Subscription[] = [];
  public total: number = 0;
  public totalElementByPage = 0;

  public data : Content[] = [];
  public temp : Content[] = [];
  public isLoadingTable = false;

  // * Variables para visualizar la orden

  public visibleDrawer = false;
  public isLoadingDrawer = false;
  public viewElement :  Content | undefined = undefined;

  // * Variables para cambiar el estatus de la orden

  public visibleEditDrawer = false;
  public isLoadingEditDrawer = false;

  // * Variables genericas  
  public isLoadingGeneral = false;

  // * Variables para realizar el filtrado de busqueda
  public validateForm!: FormGroup;

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private modal :  NzModalService,
    private message: NzMessageService,
    private router: Router,
    private reviewService: ReviewService,
  ) { }

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      codeProd: [''],
      message: [''],
      email: [''],
    });

    this.getListPaginate();
  }


  // ! Search

  submitForm(): void {

    if(this.current >= 1) {
      this.current = 1;
    }

    this.isLoadingTable = true;
    let form = this.validateForm.value;
    this.subscriptions.push(
      this.reviewService.getAllReviewsPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize,   codeProd: form.codeProd ,message: form.message ,userId: form.email }).subscribe(
        (response: Review) => {
          this.temp = response.content;
          this.data = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
          this.isLoadingTable = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingTable = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );    
  }

  // ! Listado de registros para llenar la tabla 

  getListPaginate() : void {
    this.isLoadingTable = true;
    this.subscriptions.push(
      this.reviewService.getAllReviewsPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, codeProd: this.validateForm.value["codeProd"] ,message: this.validateForm.value["message"] ,userId: this.validateForm.value["email"] }).subscribe(
        (response: Review) => {
          this.temp = response.content;
          this.data = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
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
    console.log("Change page: "  + $event);
    this.current = $event;
    this.getListPaginate();
   }

    // ! Visualizar orden o pedido
    getElementById(id : string) : void {
      this.isLoadingDrawer = true;
      this.subscriptions.push(
        this.reviewService.getReviewById(id).subscribe(
          (response: Content) => {
            this.viewElement = response;
            this.isLoadingDrawer = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingDrawer = false;
            this.message.create("error",  "Ha ocurrido un error!");
          }
        )
      );
    }
  
    openViewDrawer(element : Content): void {
      console.log(element);
      this.getElementById(element.id);
      this.visibleDrawer = true;
    }
  
    closeViewDrawer(): void {
      this.visibleDrawer = false;
      this.viewElement = undefined;
    }
  
    // ! Editar pedido
    openEditDrawer(element : Content): void {
      this.getElementById(element.id);
      this.visibleEditDrawer = true;
    }
    
    closeEditDrawer(): void {
      this.visibleEditDrawer = false;
      this.viewElement = undefined;
    }
  
    // ! Eliminar pedido
  
    deleteMessageById(id : string) : void {
      this.isLoadingGeneral = true;
      this.subscriptions.push(
        this.reviewService.deleteReview(id).subscribe(
          (response: Content) => {
            this.message.create("success",  "Se elimino de manera correcta!");
  
            // Con esto evitamos que se quede vacio cuando aun existen registros en la página 1.
            if(this.totalElementByPage == 1 && this.current != 1) {
                  this.current -= 1;
            }
  
            this.getListPaginate();
            this.isLoadingGeneral = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingGeneral = false;
            this.message.create("error",  "Ha ocurrido un error!");
          }
        )
      );
    }
  
    showDeleteConfirm(element : Content): void {
      this.modal.confirm({
        nzTitle: '¿Estas seguro de eliminar el mensaje?',
        nzContent: '<b style="color: red;"> Una vez eliminado no sera posible recupearlo! </b>',
        nzOkText: 'Eliminar',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => this.deleteMessageById(element.id),
        nzCancelText: 'Cerrar',
        nzOnCancel: () => console.log('Cancel')
      });
    }
  
    // ! Generar reporte

    
  generateExcel(): void {

    this.isLoadingGeneral = true;

    this.subscriptions.push(
      this.reviewService.getAllReviews().subscribe(
        (response: Content[]) => {

          let newJson = response.map(rec => {
            return {
              'ID': rec.id,
              'Asunto': rec.id,
              'Email': rec.id,
              'Enviado': this.getFormatedDate(rec.createdAt,"MM/dd/yyyy"),
              "Mensaje": rec.id
            }
          });
      
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newJson);
          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          /* save to file */
          XLSX.writeFile(wb, "Mensajes.xlsx");
          this.isLoadingGeneral = false;

        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingGeneral = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  private getFormatedDate(date: Date, format: string) {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, format);
  }



  





}
