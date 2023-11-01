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
  
    if (email !== "" && password !== "") {
      this.login(email, password)
        .then((response: any) => {
          const userId = response.usuario.id;
          const userName = response.usuario.nombre;
          const userRole = response.usuario.role;
  
          // Guardar la información del usuario en localStorage
          localStorage.setItem('userId', userId);
          localStorage.setItem('userName', userName);
          localStorage.setItem('userRole', userRole);
  
          this.router.navigate(['/dashboard']);
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            color: 'white',
            text: error.error.message,
            background: '#191c24',
            timer: 1500,
          });
        });
    }
  }
  
  async login(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.login(email, password)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  
}
