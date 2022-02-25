
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { Content, OrderPaginate } from 'src/app/models/OrderPaginate';
import { HttpErrorResponse } from '@angular/common/http';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import * as moment from 'moment';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/Product';
import { Address, OrderById, ProductByOrder, UserOrder } from 'src/app/models/OrderById';

@Component({
  selector: 'app-orders-control',
  templateUrl: './orders-control.component.html',
  styleUrls: ['./orders-control.component.css']
})
export class OrdersControlComponent implements OnInit {

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

  public lstProducts : Product[] = [];
  public visibleDrawer = false;
  public isLoadingDrawer = false;
  public viewOrder :  OrderById | undefined = undefined;

  // * Variables para cambiar el estatus de la orden

  public visibleEditDrawer = false;
  public isLoadingEditDrawer = false;

  // * Variables para generar el reporte

  public isLoadingGeneral = false;  
  public productsByOrder : ProductByOrder[] = [];
  public address! : Address;
  public userOrder! : UserOrder;


  //  Variables para realizar el filtrado de busqueda
  public validateForm!: FormGroup;

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private modal :  NzModalService,
    private message: NzMessageService,
    private router: Router,
    private productService : ProductService,
    private orderService: OrderService) { }

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      id: [''],
      userId: [''],
      dateBegin: ['2021-01-01 23:59:00', [Validators.required]],
      dateFinish: ['2022-12-31 23:59:00', [Validators.required]]
    });

    this.getListPaginate();
  }

  startValue: Date | null = null;
  endValue: Date | null = null;

  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;

  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.endValue) {
      return false;
    }
    return startValue.getTime() > this.endValue.getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.startValue) {
      return false;
    }
    return endValue.getTime() <= this.startValue.getTime();
  };

  handleStartOpenChange(open: boolean): void {
    if (!open) {
      this.endDatePicker.open();
    }
    console.log('handleStartOpenChange', open);
  }

  handleEndOpenChange(open: boolean): void {
    console.log('handleEndOpenChange', open);
  }

  // ! Search 

  submitForm(): void {    
    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }

    if(!this.validateForm.valid) {
      return ; 
    }

    if(this.current >= 1) {
      this.current = 1;
    }

    this.isLoadingTable = true;
    let form = this.validateForm.value;

    this.subscriptions.push(
      this.orderService.getAllOrdersPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize,  id: form.id ,userId: form.userId ,dateBegin: moment(form.dateBegin).utc().format('YYYY-MM-DD HH:MM:SS'), dateFinish: moment(form.dateFinish).utc().format('YYYY-MM-DD HH:MM:SS') }).subscribe(
        (response: OrderPaginate) => {
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

  // ! Listado de elementos
  getListPaginate() : void {
    this.isLoadingTable = true;
    this.subscriptions.push(
      this.orderService.getAllOrdersPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, id: this.validateForm.value["id"] ,userId: this.validateForm.value["userId"] ,dateBegin: moment(this.validateForm.value["dateBegin"]).utc().format('YYYY-MM-DD HH:MM:SS'), dateFinish: moment(this.validateForm.value["dateFinish"]).utc().format('YYYY-MM-DD HH:MM:SS') }).subscribe(
        (response: OrderPaginate) => {
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
      this.orderService.getOrderById(id).subscribe(
        (response: OrderById) => {
          this.viewOrder = response;
          this.userOrder = response.user;
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
    this.viewOrder = undefined;
  }

  // ! Editar pedido

  openEditDrawer(element : Content): void {
    this.getElementById(element.id);
    this.visibleEditDrawer = true;
  }
  
  closeEditDrawer(): void {
    this.visibleEditDrawer = false;
    this.viewOrder = undefined;
  }

  // ! Buscar ordenes por ID´s

  public getProductsByIds(lst : string[]) {
    this.subscriptions.push(
      this.productService.getAllProductsById(lst).subscribe(
        (response: Product[]) => {
          // this.isLoadingView = false;
          this.lstProducts = response;
        },
        (errorResponse: HttpErrorResponse) => {
          // this.isLoadingView = false;
          this.message.create("error",  errorResponse.error.message);
        }
      )
    );
  }





  // ! Eliminar pedido

  deleteMessageById(id : string) : void {
    this.isLoadingGeneral = true;
    this.subscriptions.push(
      this.orderService.deleteOrder(id).subscribe(
        (response: OrderById) => {
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
      this.orderService.getAllOrders().subscribe(
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
