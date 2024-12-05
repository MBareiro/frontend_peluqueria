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

  async onSubmit() {    
    const response: any = await this.authService.login(this.loginForm.value);    
    if(!response.error) {
      // Almacenar la información del usuario en el almacenamiento local
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('userName', response.userName);
      localStorage.setItem('userRole', response.userRole);
      localStorage.setItem('token', response.token);
      this.router.navigate(['/dashboard/list-appointment']);
    } else {      
      const errorMessage = response.error;  
      console.log(errorMessage)      
      // Manejar errores de la solicitud HTTP
      Swal.fire({
        icon: 'error',
        text: errorMessage,
        background: '#191c24',
        timer: 1500,
        color: 'white',
      });
      console.error('Error en la solicitud:', errorMessage);
    }

  } 

}
