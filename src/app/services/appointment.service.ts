import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  //private apiUrl = 'http://localhost:5000'; // Reemplaza con la URL de tu backend
  private apiUrl = environment.URL;
  constructor(private http: HttpClient) {}

  confirmAppointment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm-appointment`, data);
  }
  send_confirmation_code(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-confirmation-code`, data);
  }

  createAppointment(data: any): Observable<any> {
    console.log(data);
    
    return this.http.post<any>(`${this.apiUrl}/create-appointment`, data);
  }
  getMorningAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-morning-appointments`);
  }
  getAfternoonAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-afternoon-appointments`);
  } // En appointment.service.ts

  getSelectedAppointments(
    selectedTime: string,
    peluqueroID: number,
    selectedDate: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/get-selected-appointments/${selectedTime}/${peluqueroID}/${selectedDate}`
    );
  }

  getSpecificAppointments(
    selectedTime: string,
    selectedDate: string,
    peluqueroID: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/get-specific-appointments/${selectedTime}/${selectedDate}/${peluqueroID}`
    );
  }
  // Método para cancelar un turno
  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/cancel-appointment/${appointmentId}`
    );
  }

  // Método para cancelar turnos dentro de un rango de fechas y para un peluquero específico
cancelAppointmentsInDateRange(fromDate: string, toDate: string, peluqueroId: number): Observable<any> {
  const url = `${this.apiUrl}/cancel-appointments`;
  const body = { from_date: fromDate, to_date: toDate, peluquero_id: peluqueroId };
  const options = { body };
  
  return this.http.request('delete', url, options);
}

}
