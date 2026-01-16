import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-super-admin-login',
  templateUrl: './super-admin-login.component.html',
  styleUrls: ['./super-admin-login.component.css']
})
export class SuperAdminLoginComponent {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    try {
      const response = await this.authService.login({
        email: this.email,
        password: this.password
      });

      // Verificar que sea super admin
      const userRole = response.role || response.userRole;
      
      if (userRole !== 'super_admin') {
        this.snackBar.open('Acceso denegado. Solo super administradores.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
        return;
      }

      // Login exitoso
      this.snackBar.open('¡Bienvenido Super Admin!', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Redirigir al dashboard de super admin
      this.router.navigate(['/super-admin']);

    } catch (error: any) {
      console.error('Error en login:', error);
      
      const message = error.error?.message || 
                     error.message || 
                     'Error al iniciar sesión. Verifica tus credenciales.';
      
      this.snackBar.open(message, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      
      this.isLoading = false;
    }
  }
}
