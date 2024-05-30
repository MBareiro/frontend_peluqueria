import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
/*   private baseUrl = `${environment.apiUrl}/usuarios`;
 */  private baseUrl = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient, private router: Router) {}

  /* login(username: string, password: string): Observable<any> {
    const body = { email: username, password: password };
    return this.http.post(`${this.baseUrl}/login`, body);
  } */

  login(formValue: any) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/login`, formValue)
    );
  }

  authorized() {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (!userName || !userId || !userRole) {
      this.router.navigate(['/error-page']);
    }
  }

  logout(): Observable<any> {
    // Limpiar los datos almacenados en localStorage
    localStorage.clear();
    
    // Realizar una solicitud POST al backend para cerrar la sesión
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
  
}
