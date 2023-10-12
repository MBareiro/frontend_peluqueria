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
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, ingresa tanto el nombre de usuario como la contraseña.';
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      (response: any) => {
        const userId = response.usuario.id;
        const userName = response.usuario.apellido;

        // Guardar el ID del usuario en localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Error al iniciar sesión. Verifica tu nombre de usuario y contraseña.';
      }
    );
  }
}
