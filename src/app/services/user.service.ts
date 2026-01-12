import { firstValueFrom, Observable } from 'rxjs'; // Asegúrate de importar Observable
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  // Keep apiUrl without a trailing slash to avoid accidental double-slashes when composing endpoints
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers() { // Cambia a Observable
    return firstValueFrom(this.http.get<User[]>(this.apiUrl));
  }

  getUserById(id: number): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.apiUrl}/${id}`));
  }

  addUser(user: User) {
    return firstValueFrom(this.http.post(this.apiUrl, user));
  }

  updateUser(user: User) {
    return firstValueFrom(this.http.put(`${this.apiUrl}/${user.id}`, user));
  }

  deleteUser(id: number) {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }
  
  verifyIdUser(): number | null {
    const u = this.authService.currentUserValue;
    if (u && u.id) return Number(u.id);
    console.error('No se pudo obtener el User ID desde el estado en memoria.');
    return null;
  }

  changePassword(userId: number, oldPassword: string, newPassword: string, confirmPassword: string) {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    // Backend exposes password change under /api/password/change-password/:id
    return firstValueFrom(this.http.post(`${environment.apiUrl}/password/change-password/${userId}`, body));
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    const body = {
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    return firstValueFrom(this.http.post<{ message: string }>(`${environment.apiUrl}/password/reset-password/${token}`, body));
  }

  requestPasswordReset(email: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${environment.apiUrl}/password/forgot-password`, { email }));
  }
}
