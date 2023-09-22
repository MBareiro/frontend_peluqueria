import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser: User = { id: 0, nombre: '', apellido: '', direccion: '', password: '', email: '' };
  selectedUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.chargeUser()
  }
  
  chargeUser(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  } 

  updateUser(user: User): void {
    this.selectedUser = { ...user };  // Copy the selected user
    this.chargeUser()
  }

  saveChanges(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe(
        () => {
          console.log('User updated successfully.');
          this.selectedUser = null;
          this.chargeUser()
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    }
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe(
      () => {
        console.log('User deleted successfully.');
        this.users = this.users.filter((user) => user.id !== id);
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
    this.chargeUser()
  }

  cancelUpdate(): void {
    this.selectedUser = null;
  }
}
