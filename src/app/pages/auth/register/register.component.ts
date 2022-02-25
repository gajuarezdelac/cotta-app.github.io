import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public user!: User;
  public validateForm!: FormGroup;
  public subscriptions : Subscription[] = [];
  public isSpinning = false;
  public dateFormat = 'yyyy/MM/dd';

  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder, 
    private router: Router, 
    private message: NzMessageService) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      names: [null, [Validators.required]],
      surnames: [null, [Validators.required]],
      username: [null, [Validators.required, Validators.email]],
      gender: [null, [Validators.required]],
      password: [null, [Validators.required]],
      dateOfBirth: [null, [Validators.required]]
    });

    if(this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl("/dashboard/principal");
    }

  }

  submitForm(): void {


    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }

    if(!this.validateForm.valid) {
      this.createMessage("warning", "Es necesario llenar todos los campos!");
      return ; 
    }
  
      this.isSpinning = true;
      let form = this.validateForm.value;
      this.subscriptions.push(
        this.authenticationService.register(form).subscribe(
          (response: User) => {
          this.createMessage("success",  "Registrado correctamente!");
          this.isSpinning = false;
          this.router.navigateByUrl("/auth/login");
        },
          (errorResponse: HttpErrorResponse) => {
            this.isSpinning = false;
            this.createMessage("error",  errorResponse.error.message);             
          }
        )
      );  
  }

  createMessage(type: string, message: string): void {
    this.message.create(type, message);
  }


}
