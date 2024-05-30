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
    this.chargeUser();
  }

  async chargeUser() {
    const getUsers: any = await this.userService.getUsers(); 
    console.log(getUsers);
    
    if (!getUsers.error){
      this.users = getUsers;
    } else {
      console.error('Error fetching users:', getUsers.error);
    }   
  }

  updateUser(user: User): void {
    this.selectedUser = { ...user }; // Copy the selected user
    this.chargeUser();
  }

  async saveChanges(){
    if (this.selectedUser) {
      const updateUser = await this.userService.updateUser(this.selectedUser);

      if (!updateUser.error) {
        console.log('User updated successfully.');
        this.selectedUser = null;
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Exito!',
          background: '#191c24',
          timer: 1500,
        });
        this.chargeUser();
      } else {
        console.log('saveChanges: ', updateUser.error);
      }
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
