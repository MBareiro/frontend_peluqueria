import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide3 = true;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (email !== '' && password !== '') {
      this.login(email, password);
    }
  }

  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe(
      (response: any) => {        
        if (response.is_authenticated) {
          // Almacenar la información del usuario en el almacenamiento local
          localStorage.setItem('userId', response.usuario.id);
          localStorage.setItem('userName', response.usuario.nombre);
          localStorage.setItem('userRole', response.usuario.role);

          // Redirigir a la página principal o a la página deseada después del inicio de sesión
          // Puedes personalizar esto según tu aplicación
          this.router.navigate(['/dashboard']);
        } else {
          // Manejar el caso en el que las credenciales son incorrectas
          console.error('Credenciales incorrectas');
        }
      },
      (error) => {
        const errorMessage = error['error'];        
        // Manejar errores de la solicitud HTTP
        Swal.fire({
          icon: 'error',
          text: errorMessage['message'],
          background: '#191c24',
          timer: 1500,
          color: 'white',
        });
        console.error('Error en la solicitud:', error);
      }
    );
  }
}
