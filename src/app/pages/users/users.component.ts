
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import * as XLSX from 'xlsx';
import { Content, UserPaginate } from 'src/app/models/UserPaginate';
import { Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/models/User';
import { CustomHttpRespone } from 'src/app/models/custom-http-response';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  
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
  public viewElement :  User | undefined = undefined;


  // * Variables genericas  
  public isLoadingGeneral = false;
  public dateFormat = 'yyyy/MM/dd';


  // * Variables para agregar un usuario  
  @ViewChild('f') myForm: NgForm | undefined;
  public createForm!: FormGroup;
  public visibleCreateDrawer = false;
  public isLoadingCreateDrawer = false;


  // * Variables para editar un usuario
  @ViewChild('e') editNgForm: NgForm | undefined;
  public editForm!: FormGroup;
  public visibleEditDrawer = false;
  public isLoadingEditDrawer = false;
  public currentUsername : string | undefined = ''


  // * Variables para realizar el filtrado
  public validateForm!: FormGroup;
 


  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder,
    private modal :  NzModalService,
    private message: NzMessageService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    
    this.editForm = this.fb.group({
      names: ['', Validators.required],
      surnames: ['', Validators.required],
      username: ['', Validators.required],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      isActive: [null],
      isNonLocked: [null],
    });

    this.createForm = this.fb.group({
      names: ['', Validators.required],
      surnames: ['', Validators.required],
      username: ['', Validators.required],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      isNonLocked: [true],
    });

    this.validateForm = this.fb.group({
      username: [''],
      names: [''],
      surnames: [''],
    });

    this.getListPaginate();
   }

    // ! Busqueda 
    submitForm(): void {

      if(this.current >= 1) {
        this.current = 1;
      }
  
      this.isLoadingTable = true;
      let form = this.validateForm.value;
      this.subscriptions.push(
        this.userService.getAllUsersPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize,names:form.names,username: form.username,surnames:form.surnames }).subscribe(
          (response: UserPaginate) => {
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
        this.userService.getAllUsersPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, names: this.validateForm.value["names"], username: this.validateForm.value["username"],surnames: this.validateForm.value["surnames"]}).subscribe(
          (response: UserPaginate) => {
            this.temp = response.content;
            this.data = response.content;
            this.total = response.totalElements;
            this.totalElementByPage = response.numberOfElements;
            this.isLoadingTable = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingTable = false;
            this.message.create("error",  errorResponse.error.message);
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
        this.userService.getByUsername(id).subscribe(
          (response: User) => {
            this.viewElement = response;

            console.log(response);
            console.log(this.viewElement);
            this.isLoadingDrawer = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingDrawer = false;
            this.message.create("error",  errorResponse.error.message);
          }
        )
      );
    }
  
    openViewDrawer(element : Content): void {
      console.log(element);
      this.getElementById(element.username);
      this.visibleDrawer = true;
    }
  
    closeViewDrawer(): void {
      this.visibleDrawer = false;
      this.viewElement = undefined;
    }
  
  
    // ! Eliminar usuario
  
    deleteMessageById(id : string) : void {
      this.isLoadingGeneral = true;
      this.subscriptions.push(
        this.userService.deleteUser(id).subscribe(
          (response: CustomHttpRespone) => {
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
        nzOnOk: () => this.deleteMessageById(element.username),
        nzCancelText: 'Cerrar',
        nzOnCancel: () => console.log('Cancel')
      });
    }

    // ! Editar usuario

    editSubmit() {

      for (const i in this.editForm.controls) {
        if (this.editForm.controls.hasOwnProperty(i)) {
          this.editForm.controls[i].markAsDirty();
          this.editForm.controls[i].updateValueAndValidity();
        }
      }
  
      if(!this.editForm.valid) {
        return ; 
      }

      this.isLoadingEditDrawer = true;



      let form = this.editForm.value;
      const formData = this.userService.createUserFormDate(this.currentUsername!, form, '');
     
      this.subscriptions.push(
        this.userService.updateUser(formData).subscribe(
          (response: User) => {            
            this.getListPaginate();
            this.message.create("success",  "Usuario editado de manera correcta!");
            this.closeEditDrawer();
            this.isLoadingEditDrawer = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingEditDrawer = false;
            this.message.create("error",  errorResponse.error.message);
          }
        )
      );
 
    }

    openEditDrawer(element : Content): void {
      this.getElementById(element.username);
      this.currentUsername = element.username;
      this.visibleEditDrawer = true;
    }
    
    closeEditDrawer(): void {
      this.visibleEditDrawer = false;
      this.viewElement = undefined;
      this.currentUsername = undefined;
    }

    // ! Crear usuario

    createSubmit() {

      for (const i in this.createForm.controls) {
        if (this.createForm.controls.hasOwnProperty(i)) {
          this.createForm.controls[i].markAsDirty();
          this.createForm.controls[i].updateValueAndValidity();
        }
      }
  
      if(!this.createForm.valid) {
        return ; 
      }

      this.isLoadingCreateDrawer = true;
      let form = this.createForm.value;
      const formData = this.userService.createUserFormDate('', form, '');


      this.subscriptions.push(
        this.userService.addUser(formData).subscribe(
          (response: User) => {
            this.getListPaginate();
            this.message.create("success",  "Usuario creado de manera correcta!");
            this.closeCreateDrawer();
            this.createForm.reset();
            this.isLoadingCreateDrawer = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoadingCreateDrawer = false;
            this.message.create("error",  errorResponse.error.message);
          }
        )
      );
 
  

    }

    openCreateDrawer(): void {
      this.visibleCreateDrawer = true;
    }
  
    closeCreateDrawer(): void {
      this.visibleCreateDrawer = false;
    }
    
  
    // ! Generar reporte

    
  generateExcel(): void {

    this.isLoadingGeneral = true;

    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {

          let newJson = response.map(rec => {
            return {
              'ID': rec.username,
              'Asunto': rec.username,
              'Email': rec.username,
              "Mensaje": rec.username
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

  private getFormatedDate(date: Date) {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'yyyy/MM/dd');
  }



     
     

}
