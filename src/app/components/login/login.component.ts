import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = ''; // Propiedad para almacenar mensajes de error

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.username == "" || this.password == "") {
      this.errorMessage = 'Rellene todos los campos'; // Establecer mensaje de error
    } else {
      const isAuthenticated = this.authService.login(this.username, this.password);
      if (isAuthenticated) {
        // Redireccionar a la página principal de la peluquería (dashboard)
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos'; // Establecer mensaje de error
      }
    }    
  }
}
