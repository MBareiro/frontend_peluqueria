import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent {

  newUser: User = { id: 0, nombre: '', apellido: '', direccion: '', password: '', email: '' };
  
  constructor(private userService: UserService) {}
  addUser(): void {
    this.userService.addUser(this.newUser).subscribe(
      () => {
        console.log('User added successfully.');
        this.newUser = { id: 0, nombre: '', apellido: '', direccion: '', password: '', email: '' };
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }
}
