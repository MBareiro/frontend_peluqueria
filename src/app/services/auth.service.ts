import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Esto significa que el servicio estará disponible en toda la aplicación
})
export class AuthService {
  private loggedIn = false;

  login(username: string, password: string): boolean {
    // Lógica de autenticación aquí, por ejemplo, verificar credenciales
    if (username === 'usuario' && password === 'contraseña') {
      this.loggedIn = true;
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn = false;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}
