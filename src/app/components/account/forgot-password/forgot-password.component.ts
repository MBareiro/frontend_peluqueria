import { Component } from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  
    constructor(private userService: UserService){
      
    }
  
    getErrorMessage() {
      if (this.email.hasError('required')) {
        return 'You must enter a value';
      }
      return this.email.hasError('email') ? 'Not a valid email' : '';
    }
    onSubmit() {
      const emailValue = this.email.value; // Obtener el valor del campo de correo electrónico
    
      if (emailValue !== null) {
        console.log(emailValue);
        
        this.userService.requestPasswordReset(emailValue).subscribe(
          response => {
            console.log(response)
          },
          error => {
            console.log(error)
          }
        );
      } else {
        // Manejar el caso en que el valor de correo electrónico sea nulo
        // Puedes mostrar un mensaje al usuario o realizar alguna otra acción apropiada.
      }
    }
    
  
}
  

