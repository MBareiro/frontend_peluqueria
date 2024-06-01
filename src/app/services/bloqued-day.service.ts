import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BloquedDayService {
  private apiUrl = environment.apiUrl + "bloqued-days";
  constructor(private http: HttpClient) {}

  // Método actualizado para aceptar un array de fechas
  createBlockedDays(dates: string[], user_id: number) {
    const payload = { dates, user_id };
    return firstValueFrom(this.http.post(`${this.apiUrl}/create-blocked-days`, payload));
  }

  getBlockedDays(user_id: number) {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/get-blocked-days/${user_id}`)
    );
  }

  deleteBlockedDays(user_id: number, dates: string[]) {
    const data = { user_id, dates }; // Crear un objeto con "user_id" y "dates"
    return firstValueFrom(
      this.http.delete<any[]>(`${this.apiUrl}/delete-blocked-days`, {
        body: data,
      })
    );
}

}
