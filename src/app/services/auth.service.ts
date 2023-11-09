import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; 
@Injectable({
  providedIn: 'root' // Esto significa que el servicio estará disponible en toda la aplicación
})
export class AuthService {
 
  //private baseUrl = 'http://your-flask-backend-url'; // Replace with your backend URL
  //private baseUrl =  "http://localhost:5000/usuarios";
  private baseUrl = environment.URL + "/usuarios";
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    const body = { email: username, password: password };
    return this.http.post(`${this.baseUrl}/login`, body);
  }

  authorized(){
    const userName = localStorage.getItem('userName');   
    const userId = localStorage.getItem('userId');   
    const userRole = localStorage.getItem('userRole');  
    if(!userName || !userId || !userRole){
      this.router.navigate(['/error-page']);
    }
  }
  logout() {
    // Eliminar el ID del usuario del almacenamiento local al cerrar sesión
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }
}
