import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  private token?: string;
  hide2 = true;
  hide3 = true;

  passwordForm: FormGroup = new FormGroup({   
    newPassword: new FormControl('', [Validators.required, Validators.minLength(10)]),
    confirmPassword:  new FormControl('', [Validators.required, Validators.minLength(10)]),
  }); 

  newPassword: string = '';
  confirmPassword: string = '';
  responseMessage: any;

  constructor(private formBuilder: FormBuilder, private userService: UserService, private route: ActivatedRoute,) {}
  
  ngOnInit() {
    // Obtiene el token de la URL
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  changePassword(): void {    
    if (this.token) {
      const user = {
        token: this.token,
        new_password: this.passwordForm.value.newPassword,
        confirm_password: this.passwordForm.value.confirmPassword,        
      };
      console.log(user.new_password);
      // Agregar validaciones de contraseña si es necesario
      this.userService
        .resetPassword(
          user.token,
          user.new_password,
          user.confirm_password          
        )
        .subscribe(
          (response) => {
            this.responseMessage = "Contraseña actualizada exitosamente!";
            /* Swal.fire({
              icon: 'success',
              color: 'white',
              text: 'Exito!',
              background: '#191c24',
              timer: 1500,
            }) */
            this.passwordForm.reset()
          },
          (error) => {
            /* Swal.fire({
              icon: 'error',
              color: 'white',
              text: 'Ups! Ha habido un error.',
              background: '#191c24',
            }) */
            this.responseMessage = error.message;
            // Mostrar un mensaje de error al usuario
          }
        );
    } 
  }  

  onSubmit() {
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        color: 'white',
        text: 'Las contraseñas no coinciden',
        background: '#191c24'
      })
      // Mostrar un mensaje de error al usuario
    } else {
      // Implementa aquí las validaciones de complejidad de contraseña si es necesario
      // Llama a la función para cambiar la contraseña
      this.changePassword();
    }
  }
}
