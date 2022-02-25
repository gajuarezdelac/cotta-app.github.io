import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs/internal/Subscription';
import { CustomHttpRespone } from 'src/app/models/custom-http-response';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public user!: User;
  public validateForm!: FormGroup;
  public subscriptions : Subscription[] = [];
  public isSpinning = false;

  constructor(
    private authenticationService : AuthService,
    private actRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router, 
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [this.actRoute.snapshot.params.email],
      token: [this.actRoute.snapshot.params.token],
      password: [null, [Validators.required]],
      newPassword: [null, [Validators.required]],
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
      return ; 
    }

    if(this.validateForm.value["password"] != this.validateForm.value["newPassword"]) {
      this.createMessage("warning", "Las contraseñas no coinciden");
      return ; 
    }

    this.isSpinning = true;
    let form = this.validateForm.value;
    this.subscriptions.push(
      this.authenticationService.resetPassword(form).subscribe(
        (response: CustomHttpRespone) => {
          this.isSpinning = false;
          this.createMessage("success",  "Contraseña restablecida correctamente!");
          this.router.navigateByUrl('/auth/login');
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
