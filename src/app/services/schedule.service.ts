
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  //private backendUrl = 'http://localhost:5000'; // Reemplaza con la URL de tu servidor Flask
  private apiUrl = environment.URL;

  constructor(private http: HttpClient) {}

  guardarHorarios(horarios: any): Observable<any> {
    const url = `${this.apiUrl}/guardar_horarios`;
    return this.http.post(url, horarios);
  }

  getHorarioUsuario(userId: string): Observable<any> {
    const url = `${this.apiUrl}/obtener_horario_usuario/${userId}`;
    return this.http.get(url);
}

}
