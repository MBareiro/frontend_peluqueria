import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser: User[] = [];
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
          Swal.fire({
            icon: 'success',
            color: 'white',
            text: 'Turno Creado!',
            background: '#191c24',
            timer: 1500,
          })
          this.chargeUser()
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    }
  }

  cancelUpdate(): void {
    this.selectedUser = null;
  }
  
  toggleActive(user: User): void {
    if (user) {
      user.active = !user.active;
        // Invertir el estado
    }
  }
}
