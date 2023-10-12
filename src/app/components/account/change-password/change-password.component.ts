import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  hide1 = true;
  hide2 = true;
  hide3 = true;

  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService) {}

  changePassword(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      const user = {
        old_password: this.oldPassword,
        new_password: this.newPassword,
        confirm_password: this.confirmPassword,
      };
      console.log(userId);
      this.userService
        .changePassword(
          parseInt(userId),
          user.old_password,
          user.new_password,
          user.confirm_password
        )
        .subscribe(
          (data) => {
            console.log('Password changed successfully:', data);
          },
          (error) => {
            console.error('Error changing password:', error);
          }
        );
    } else {
      console.error('No user ID found in localStorage.');
    }
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      console.error('Las constraseña nueva y su confirmacion no coinciden');
    } else {
      // Implement logic for changing the password here
      this.changePassword();
    }
  }
}
