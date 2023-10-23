import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { FormValidators } from '../../shared/form-validators/form-validators';
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
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

  constructor(private userService: UserService, public formValidator: FormValidators) {}

  addUser(): void {
    // Access the form values
    const formData = this.addressForm.value;
  
    // Create a new User object and map the form values to it
    const newUser: User = {
      id: 0,
      nombre: formData.firstName || '',
      apellido: formData.lastName || '',
      direccion: formData.direccion || '',
      email: formData.email || '',
      telefono: formData.telefono || '',
      role: formData.role || '',
      active: true,
      password: ''
    };
  
    // Call the service to add the user
    this.userService.addUser(newUser).subscribe(
      () => {
        console.log('User added successfully.');
        this.addressForm.reset();  // Reset the form after successful addition
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Usuario Creado!',
          background: '#191c24',
          timer: 1500,
        })
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }
  
  
}
