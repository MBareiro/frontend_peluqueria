import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormValidators } from '../../shared/form-validators/form-validators';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  addressForm: FormGroup;
  formularioEnviadoExitoso = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public formValidator: FormValidators,
    private snackBar: MatSnackBar
  ) {
    this.addressForm = this.formBuilder.group({
      id: [''],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      active: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    try {
      const userId: number | null = this.userService.verifyIdUser(); // Llamada a verifyIdUser()

      if (userId !== null) {
        // Llamada a getUserById dentro de esta condición
        const response: any = await this.userService.getUserById(userId);
        this.addressForm.patchValue(response); // Pobla el formulario con los datos del usuario
      } else {
        this.snackBar.open('No se pudo obtener el User ID', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error al obtener datos del usuario', 'Cerrar', { duration: 3000 });
    }
  }

  async onSubmit() {
    this.formularioEnviadoExitoso = true;
    const formData = this.addressForm.value;
    if (this.addressForm.valid) {
      try {
        await this.userService.updateUser(formData);
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 2000 });
        const { default: Swal } = await import('sweetalert2');
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Perfil actualizado',
          background: '#191c24',
          timer: 1500,
        });
      } catch (error) {
        this.snackBar.open('Error al actualizar perfil', 'Cerrar', { duration: 3000 });
      }
    } else {
      this.snackBar.open('Formulario inválido. Por favor, revisa los campos.', 'Cerrar', { duration: 3000 });
    }
    this.formularioEnviadoExitoso = false;
  }
}
