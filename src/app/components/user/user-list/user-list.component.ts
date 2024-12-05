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

    if (!getUsers.error) {
      this.users = getUsers;
    } else {
      console.error('Error fetching users:', getUsers.error);
    }
  }

  updateUser(user: User): void {
    this.selectedUser = { ...user }; // Copy the selected user
    this.chargeUser();
  }

  async deleteUser(id_user: number): Promise<void> {
    try {  
      Swal.fire({
        title: "¿Estas seguro?",
        text: "Se eliminaran permanentemente todos los datos del usuario ¡No podrás revertir esto!",
        icon: "warning",
        background: '#191c24',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        color: 'white',
        confirmButtonText: "Eliminar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await this.userService.deleteUser(id_user);
          console.log(response);
          Swal.fire({
            title: "¡Eliminado!",
            text: "El usuario ha sido eliminado.",
            icon: "success",
            color: 'white',
            background: '#191c24',
          });
          this.selectedUser = null;
          this.chargeUser();
        }
      });   
   
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }

  async saveChanges() {
    if (this.selectedUser) {
      try {
        await this.userService.updateUser(this.selectedUser);
        this.selectedUser = null;
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Exito!',
          background: '#191c24',
          timer: 1500,
        });
        this.chargeUser();
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
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
