import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { Content, Inbox } from 'src/app/models/Inbox';
import { AuthService } from 'src/app/services/auth.service';
import { InboxService } from 'src/app/services/inbox.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-inbox-control',
  templateUrl: './inbox-control.component.html',
  styleUrls: ['./inbox-control.component.css']
})
export class InboxControlComponent implements OnInit {

  // Variables de la tabla
  public pageSize: number = 10;
  public current: number = 1;
  public subscriptions : Subscription[] = [];
  public total: number = 0;
  public totalElementByPage = 0;

  public data : Content[] = [];
  public temp : Content[] = [];
  public isLoadingTable = false;


  // Variables para visualizar el mensaje  
  public visibleDrawer = false;
  public isLoadingDrawer = false;
  public viewInbox :  Content | undefined = undefined;

  // Variables para general el reporte de excel
  public isLoadingGeneral = false;

  //  Variables para realizar el filtrado de busqueda
  public validateForm!: FormGroup;


  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal :  NzModalService,
    private router: Router,
    private inboxService : InboxService
  ) { }

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      subject: [''],
      content: [''],
      email: ['']
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
      this.inboxService.getAllMessagesPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize,  subject: form.subject ,content: form.content ,email: form.email }).subscribe(
        (response: Inbox) => {
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


  // ! Get list of messages

  getListPaginate() : void {
    this.isLoadingTable = true;
    this.subscriptions.push(
      this.inboxService.getAllMessagesPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, subject: this.validateForm.value["subject"] ,content: this.validateForm.value["content"] ,email: this.validateForm.value["email"] }).subscribe(
        (response: Inbox) => {
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

  // ! View message

  getElementById(id : string) : void {
    this.isLoadingDrawer = true;
    this.subscriptions.push(
      this.inboxService.getMessageById(id).subscribe(
        (response: Content) => {
          this.viewInbox = response;
          this.isLoadingDrawer = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingDrawer = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  openDrawer(element : Content): void {
    console.log(element);
    this.getElementById(element.id);
    this.visibleDrawer = true;
  }

  closeDrawer(): void {
    this.visibleDrawer = false;
    this.viewInbox = undefined;
  }


  // ! Delete message

  
  deleteMessageById(id : string) : void {
    this.isLoadingGeneral = true;
    this.subscriptions.push(
      this.inboxService.deleteMessage(id).subscribe(
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
          this.message.create("success",  "Ha ocurrido un error!");
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

  // ! Generar reporte de excel

  generateExcel(): void {

    this.isLoadingGeneral = true;


    this.subscriptions.push(
      this.inboxService.getAllMessages().subscribe(
        (response: Content[]) => {

          let newJson = response.map(rec => {
            return {
              'ID': rec.content,
              'Asunto': rec.subject,
              'Email': rec.email,
              'Enviado': this.getFormatedDate(rec.createdAt,"MM/dd/yyyy"),
              "Mensaje": rec.content
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

  
  createMessage(type: string, message: string): void {
    this.message.create(type, message);
  }



}



