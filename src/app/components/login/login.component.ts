import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';

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
    
    this.authService.login(email, password)
  .subscribe(
    (response: any) => {
      const userId = response.usuario.id;
      const userName = response.usuario.nombre;
      const userRole = response.usuario.role; // Suponiendo que el rol del usuario se encuentra en 'role' en la respuesta
    
      // Guardar la información del usuario en localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userRole', userRole); // Almacenar el rol del usuario

      this.router.navigate(['/dashboard']);
    },
    (error) => {
      console.error('Login error:', error);
      this.errorMessage = 'Error al iniciar sesión. Verifica tu nombre de usuario y contraseña.';
    }
  );

  }
}
