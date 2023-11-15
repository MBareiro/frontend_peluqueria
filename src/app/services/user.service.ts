import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  addUser(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  verifyIdUser(): number | null {
    const userId: string | null = localStorage.getItem('userId');

    if (userId !== null) {
      const userIdNumber: number = parseInt(userId, 10); // Convertir a número

      if (!isNaN(userIdNumber)) {
        // userIdNumber ahora es un número válido
        console.log('User ID:', userIdNumber);
        return userIdNumber;
      } else {
        console.error('No se pudo convertir a número:', userId);
        return null;
      }
    } else {
      console.error('No se pudo obtener el User ID desde localStorage.');
      return null;
    }
  }

  changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    return this.http.post(`${this.apiUrl}/change-password/${userId}`, body);
  }

  // Es utilizada por reset-password.ts
  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    const body = {
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    return this.http.post(`${environment.apiUrl}/reset-password/${token}`, body);
  }

  // Es utilizada por forgot-password.ts
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/forgot-password`,
      { email }
    );
  }
}
