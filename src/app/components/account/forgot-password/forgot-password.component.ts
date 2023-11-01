import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

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

  constructor(private userService: UserService) { }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Debe ingresar un Ingrese su correo electrónico';
    }
    return this.email.hasError('email') ? 'Correo electrónico inválido' : '';
  }
  async onSubmit() {
    const emailValue = this.email.value; // Obtener el valor del campo de correo electrónico

    if (emailValue !== null) {
      console.log(emailValue);
      this.userService.requestPasswordReset(emailValue).subscribe(
        response => {
          console.log(response)
          this.responseMessage = response.message;
        },
        error => {
          console.log(error)
        }
      );
    } 
  }
}


