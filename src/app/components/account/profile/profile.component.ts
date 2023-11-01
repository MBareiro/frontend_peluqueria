import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
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
    public formValidator: FormValidators
  ) {
    this.addressForm = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]], 
      email: ['', [Validators.required, Validators.email]],
      active: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const userId: number | null = this.userService.verifyIdUser(); // Llamada a verifyIdUser()

    if (userId !== null) {
      // Llamada a getUserById dentro de esta condición
      this.userService.getUserById(userId).subscribe(
        (userData) => {
          this.addressForm.patchValue(userData); // Pobla el formulario con los datos del usuario
        },
        (error) => {
          console.error('Error al obtener datos del usuario:', error);
        }
      );
    } else {
      console.error('No se pudo obtener el User ID desde localStorage.');
    }
  }    

  onSubmit() {
    this.formularioEnviadoExitoso = true;
    const formData = this.addressForm.value;
    if (this.addressForm.valid) {
      this.userService.updateUser(formData).subscribe(
        (Response) => {
          console.log('User updated successfully.', Response);
          Swal.fire({
            icon: 'success',
            color: 'white',
            text: 'Perfil actualizado',
            background: '#191c24',
            timer: 1500,
          })
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
    }
    this.formularioEnviadoExitoso = false;
  }
}
