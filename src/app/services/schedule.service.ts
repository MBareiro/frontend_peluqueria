
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private backendUrl = 'http://localhost:5000'; // Reemplaza con la URL de tu servidor Flask

  constructor(private http: HttpClient) {}

  guardarHorarios(horarios: any): Observable<any> {
    const url = `${this.backendUrl}/guardar_horarios`;
    return this.http.post(url, horarios);
  }

  getHorarioUsuario(userId: string): Observable<any> {
    const url = `${this.backendUrl}/obtener_horario_usuario/${userId}`;
    return this.http.get(url);
}

}
