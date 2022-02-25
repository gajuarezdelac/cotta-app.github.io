import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { FileUploadStatus } from 'src/app/models/file-upload-status';
import { Generic } from 'src/app/models/Generic';
import { Order } from 'src/app/models/Order';
import { OrderById } from 'src/app/models/OrderById';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { GenericService } from 'src/app/services/generic.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  // Variables globales

  public subscriptions: Subscription[] = [];

  // Variables para actualizar la imagen de perfil
  public fileName!: string | null;
  public profileImage!: File | null;
  public fileStatus = new FileUploadStatus();

  // Variables para actualizar la información del usuario logueado.
  public editForm! : FormGroup;
  public submitted = true;
  public btnloader = false;
  
  public user: User | undefined;
  public currentUsername : User | undefined;

  public isLoadingEdit = false;
  public isLoadingView = false;

  // Variables para el listado de ordenes
  public isLoadingOrders = false;
  public lstOrders : OrderById[] = [];
  

  // Variables para el listado de ordenes
  public isLoadingGeneral = false;

  // Restablecer contraseña
  public resetForm! : FormGroup;
  public isLoadingReset = false;

  // Get all states 
  public isLoadingState = false;
  public lstState : Generic[] = [];

 

  constructor(
    private authenticationService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private userService: UserService,
    private modal: NzModalService,
    private orderService: OrderService,
    private genericService : GenericService
  ) { }

  ngOnInit(): void {
    if(this.authenticationService.isUserLoggedIn()) {
      this.user = this.authenticationService.getUserFromLocalCache();
      this.getUerByUsername();
      this.getOrdersByUsers();
      this.getAllStates();
    } else {  
      this.router.navigateByUrl("/home");
    }

    this.editForm = this.fb.group({
      names: ['', Validators.required],
      surnames: ['', Validators.required],
      username: ['', Validators.required],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      numberPhone: [null, Validators.required]
    });

    this.resetForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', Validators.required],
      newpassword: ['', Validators.required],
    })
  }


  get f() { return this.editForm.controls; }

  // ! Get user by username
  getUerByUsername() {
    this.isLoadingView = true;
    this.subscriptions.push(
      this.userService.getByUsername(this.user!.username).subscribe(
        (response: User) => {
          console.log(response);
          this.currentUsername = response;
          this.isLoadingView = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingView = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  // ! Actualizar información del usuario
  onSubmit() {
    
     
    for (const i in this.editForm.controls) {
      if (this.editForm.controls.hasOwnProperty(i)) {
        this.editForm.controls[i].markAsDirty();
        this.editForm.controls[i].updateValueAndValidity();
      }
    }


    if (this.editForm.invalid) { return; }

    this.isLoadingEdit = true;
    let form = this.editForm.value;
    
    this.subscriptions.push(
      this.userService.updateProfile(this.user?.username!, form).subscribe(
        (response: User) => {
          this.isLoadingEdit = false;
          this.message.create("success",  "Perfil actualizado correctamnete!");
        },
        (errorResponse: HttpErrorResponse) => {
          this.btnloader = false;
          this.isLoadingEdit = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }


  // ! Reset my password

  onResetPassword() {

    for (const i in this.resetForm.controls) {
      if (this.resetForm.controls.hasOwnProperty(i)) {
        this.resetForm.controls[i].markAsDirty();
        this.resetForm.controls[i].updateValueAndValidity();
      }
    }

    if (this.resetForm.invalid) { return; }

    this.isLoadingReset = true;
    let form = this.editForm.value;
    

  }

     
  isNull(e : any) : string {
    if(e == '' || e == undefined){
      return 'Sin número'
    }
    return e;
  }

  getInitials() {
    
    let text = this.user?.names + ' ' + this.user?.surnames;
    let names = text?.split(' '),
        initials = names![0].substring(0, 1).toUpperCase();
    
    if (names!.length > 1) {
        initials += names![names.length - 1].substring(0, 1).toUpperCase();
    }

    return initials;
};

  

  // ! Delete my profile
  deleteMyProfile() {
    this.isLoadingGeneral = true;
    this.subscriptions.push(
      this.userService.desactivateByUsername(this.user?.username!).subscribe(
        (response: User) => {
          this.authenticationService.logOut();
          this.user = undefined;
          this.message.create("success",  "Tu perfil se ha desabilidado correctamente");
          this.router.navigate(['/auth/register']);
          this.isLoadingGeneral = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.btnloader = false;
          this.isLoadingGeneral = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this task?',
      nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteMyProfile(),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }


  // ! Get orders by user
  public getOrdersByUsers() {

    this.isLoadingOrders = true;
    this.subscriptions.push(
      this.orderService.getOrdersByUser("3030202020").subscribe(
        (response: OrderById[]) => {
          this.lstOrders = response;
          this.isLoadingOrders = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingOrders = false;
          this.message.create("error",  "Ha ocurrido un error!");
        }
      )
    );
  }


  public getAllStates() {
    this.isLoadingState = true;
    this.subscriptions.push(
      this.genericService.getAllOrders().subscribe(
        (response: Generic[]) => {
          this.lstState = response;
          this.isLoadingState = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingState = false;
          this.message.create("error",  "Error al recuperar los estados!");
        }
      )
    );
   }


  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user!.username);
    formData.append('profileImage', this.profileImage!);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  
  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * event.loaded / event.total!);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          this.user!.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.fileStatus.status = 'done';
          break;
        } else {
          this.message.create("error",  "Ha ocurrido un error!");
          break;
        }
      default:
        `Finished all processes`;
    }
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }


  private clickButton(buttonId: string): void {
    // Puede llegar null
    document.getElementById(buttonId)?.click();
  }




}
