import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { FormValidators } from '../../shared/form-validators/form-validators';
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  addressForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    direccion: [null, Validators.required],
    telefono: [null, Validators.required],
    password: [null, Validators.required],
    email: new FormControl('', [Validators.required, Validators.email]),
    role: [null, Validators.required],
  });

  constructor(
    private userService: UserService,
    public formValidator: FormValidators
  ) {}

  async addUser(): Promise<void> {
    const formData = this.addressForm.value;
  
    const newUser: User = {
      id: 0,
      first_name: formData.firstName || '',
      last_name: formData.lastName || '',
      address: formData.direccion || '',
      email: formData.email || '',
      phone: formData.telefono || '',
      role: formData.role || '',
      active: true,
      password: '',
    };
  
    try {
      const createUser: any = await this.userService.addUser(newUser);
      this.addressForm.reset(); // Reset the form after successful addition
      Swal.fire({
        icon: 'success',
        color: 'white',
        text: 'Usuario Creado!',
        background: '#191c24',
        timer: 1500,
      });
    } catch (error: any) {
      let errorMessage = 'Ocurrió un error al agregar el usuario.';
      
      if (error.status === 409) {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Por favor, inténtelo de nuevo más tarde.';
      }
  
      Swal.fire({
        icon: 'error',
        color: 'white',
        text: errorMessage,
        background: '#191c24',
        timer: 1500,
      });
    }
  }
  
  
  
}
