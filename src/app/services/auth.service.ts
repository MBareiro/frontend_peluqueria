import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Esto significa que el servicio estará disponible en toda la aplicación
})
export class AuthService {
 
  //private baseUrl = 'http://your-flask-backend-url'; // Replace with your backend URL
  private baseUrl =  "http://localhost:5000/usuarios";

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const body = { email: username, password: password };
    return this.http.post(`${this.baseUrl}/login`, body);
  }

  logout() {
    // Eliminar el ID del usuario del almacenamiento local al cerrar sesión
    localStorage.removeItem('userId');
  }
}
