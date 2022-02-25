import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
// import { NzNotificationPlacement, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public validateForm!: FormGroup;
  public subcriptions : Subscription[] = [];
  public siteKey = environment.siteKey;
  public isSpinning = false;
  
  constructor(
    private authenticationService : AuthService,
    private fb: FormBuilder, 
    private router: Router, 
    private message: NzMessageService) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      recaptcha: ['', Validators.required],
      remember: [true]
    });

    if(this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl("/dashboard/statistics");
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
    let user = this.validateForm.value;
    this.subcriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);     
          this.authenticationService.saveToken(token!);
          this.authenticationService.addUserToLocalCache(response.body!);
          this.isSpinning = false;
          this.router.navigateByUrl('/dashboard/statistics');
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
