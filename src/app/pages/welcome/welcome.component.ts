import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  
  isCollapsed = false;



  constructor(
    private message: NzMessageService,
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  
  public onLogOut(): void {
    this.authService.logOut();
    this.router.navigate(['/login']);
    this.message.create("success",  "Sesión cerrada de manera correcta!");
  }


}
