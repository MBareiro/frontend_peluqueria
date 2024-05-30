import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedule`;

  constructor(private http: HttpClient) {}

  guardarHorarios(horarios: any): Observable<any> {
    const url = `${this.apiUrl}/guardar_horarios`;
    return this.http.post(url, horarios);
  }

  getHorarioUsuario(userId: string) {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/obtener_horario_usuario/${userId}`)
    );
  }  
}
