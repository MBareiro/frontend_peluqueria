import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
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
      telefono: ['', [Validators.required]], 
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
          // Podrías mostrar un mensaje de error al usuario en la interfaz
        }
      );
    } else {
      console.error('No se pudo obtener el User ID desde localStorage.');
    }
  }    
  
  // Este método puede ser utilizado para enviar el formulario
  onSubmit() {
    this.formularioEnviadoExitoso = true;
    const formData = this.addressForm.value;
    if (this.addressForm.valid) {
      this.userService.updateUser(formData).subscribe(
        (Response) => {
          console.log('User updated successfully.', Response);
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
      // Aquí puedes enviar los datos del formulario
      //console.log('Formulario válido. Datos:', this.addressForm.value);
      // Puedes agregar la lógica para enviar los datos al servidor
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      // Podrías mostrar un mensaje de error al usuario en la interfaz
    }
  }
}
