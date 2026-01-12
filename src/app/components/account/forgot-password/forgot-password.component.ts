import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  @Component({
    selector: 'app-change-email',
    templateUrl: './change-email.component.html',
    styleUrls: ['./change-email.component.css']
  })

  email = new FormControl('', [Validators.required, Validators.email]);
  responseMessage: any;

  constructor(private userService: UserService, private snackBar: MatSnackBar) { }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Debe ingresar un Ingrese su correo electrónico';
    }
    return this.email.hasError('email') ? 'Correo electrónico inválido' : '';
  }
  async onSubmit() {
    const emailValue = this.email.value; // Obtener el valor del campo de correo electrónico
  
    if (emailValue !== null) {
      try {
        const response = await this.userService.requestPasswordReset(emailValue); // Esperar la respuesta de la Promesa
        this.responseMessage = response.message;
      } catch (error) {
        this.snackBar.open('Error al solicitar restablecimiento', 'Cerrar', { duration: 3000 });
      }
    }
  }
  
}


