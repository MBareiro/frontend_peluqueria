import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  //---------------------POST-------------------------
  confirmAppointment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm-appointment`, data);
  }
  
  check_active_appointment(data: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/check-active-appointment`, data));
  }
  
  send_confirmation_code(data: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/send-confirmation-code`, data));
  }
  createAppointment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-appointment`, data);
  }

  getAppointmentById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  //---------------------GET-------------------------
  getMorningAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-morning-appointments`);
  }
  getAfternoonAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-afternoon-appointments`);
  }
  getSelectedAppointments(selectedTime: string, peluqueroID: number, selectedDate: string) {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/get-selected-appointments/${selectedTime}/${peluqueroID}/${selectedDate}`));
  }
  getSpecificAppointments(selectedTime: string, selectedDate: string, peluqueroID: number) {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/get-specific-appointments/${selectedTime}/${selectedDate}/${peluqueroID}`));
    
  }
  checkIfAppointmentTaken(email: string, date: Date | string, peluqueroId: number): Observable<{ appointment_taken: boolean }> {
    return this.http.get<{ appointment_taken : boolean }>(
      `${this.apiUrl}/get-appointment-email/${email}/${date}/${peluqueroId}`
    );
  }

//---------------------DELETE-------------------------
  
  userCancelAppointment(appointmentId: number): Observable<any> {    
    return this.http.delete(`${this.apiUrl}/user-cancel-appointment/${appointmentId}`);
  }
  // Método para cancelar turnos dentro de un rango de fechas y para un peluquero específico
  cancelAppointments(dates: string[], peluqueroId: number) {
    const url = `${this.apiUrl}/cancel-appointments`;
    const body = { dates, hairdresserId: peluqueroId };

    return firstValueFrom(
      this.http.request<any[]>('delete', url, { body })
    );
  }
  cancelAllAppointments(peluqueroId: number): Observable<any> {
    const url = `${this.apiUrl}/cancel-all-appointments`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { hairdresserId: peluqueroId };
    return this.http.delete(url, { headers, body });
  }

  cancelAppointment(appointmentId: number, newState: string) {
    const endpoint = `${this.apiUrl}/cancel`;
    const body = { appointmentId, newState };
    return this.http.post(endpoint, body);
  }
}
