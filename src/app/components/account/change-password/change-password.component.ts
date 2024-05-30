import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  hide1 = true;
  hide2 = true;
  hide3 = true;

  passwordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
  });

  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  async changePassword(): Promise<void> {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const user = {
        old_password: this.passwordForm.value.oldPassword,
        new_password: this.passwordForm.value.newPassword,
        confirm_password: this.passwordForm.value.confirmPassword,
      };
      // Agregar validaciones de contraseña si es necesario
      const changePassword: any = await this.userService.changePassword(
        parseInt(userId),
        user.old_password,
        user.new_password,
        user.confirm_password
      );
      if (!changePassword.error) {
        //console.log('Password changed successfully:', data);
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Exito!',
          background: '#191c24',
          timer: 1500,
        });
        this.passwordForm.reset();
      } else {
        console.error('Error changing password:', changePassword.error);
        Swal.fire({
          icon: 'error',
          color: 'white',
          text: 'Contraseña antigua incorrecta',
          background: '#191c24',
        });
      }
    } else {
      console.error('No user ID found in localStorage.');
    }
  }

  onSubmit() {
    if (
      this.passwordForm.value.newPassword !==
      this.passwordForm.value.confirmPassword
    ) {
      Swal.fire({
        icon: 'warning',
        color: 'white',
        text: 'Las contraseñas no coinciden',
        background: '#191c24',
      });
      // Mostrar un mensaje de error al usuario
    } else {
      // Implementa aquí las validaciones de complejidad de contraseña si es necesario

      // Llama a la función para cambiar la contraseña
      this.changePassword();
    }
  }
}
