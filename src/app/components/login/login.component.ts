import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent { 
  username = '';
  password = '';

  constructor(private AuthService: AuthService, private router: Router) {}

  onSubmit() {
    this.AuthService.login(this.username, this.password).subscribe(
      (response: any) => {  // Here, 'any' is used to avoid TypeScript errors
        const userId = response.userId;
        localStorage.setItem('userId', userId);
        console.log('Login successful:', response);
        this.router.navigate(['/dash']);
      },
      (error) => {
        console.error('Login error:', error);
      }
    );
  }
  
}
