import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5000'; // Reemplaza con la URL de tu backend

  constructor(private http: HttpClient) {}

  enviarFormulario(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/submit-form`, data);
  }

  getMorningAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-morning-appointments`);
  }
  getAfternoonAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-afternoon-appointments`);
  } // En appointment.service.ts

  getSelectedAppointments(selectedTime: string, peluqueroID: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/get-selected-appointments/${selectedTime}/${peluqueroID}`
    );
  }

  getSpecificAppointments(selectedTime: string, selectedDate: string, peluqueroID: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/get-specific-appointments/${selectedTime}/${selectedDate}/${peluqueroID}`
    );
  }
  
}
