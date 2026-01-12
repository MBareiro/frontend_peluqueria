import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Service } from '../models/service.model';
import { environment } from '../../environments/environment';

export interface EmployeeServiceEntry {
  id?: number;
  employee_id: number;
  employee_name?: string;
  service_id?: number;
  price?: number;
  duration?: number;
  offered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private baseUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) { }

  // List all global services
  list(): Observable<Service[]> {
    return this.http.get<Service[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  // Get single service
  get(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new global service
  create(payload: Service): Observable<any> {
    return this.http.post(this.baseUrl, payload)
      .pipe(catchError(this.handleError));
  }

  // Update global service
  update(id: number, payload: Partial<Service>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  // Delete global service
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // List barbers offering a given service (barber-specific entries)
  listBarbersForService(serviceId: number): Observable<EmployeeServiceEntry[]> {
    // backend uses "employees" naming for the route
    return this.http.get<EmployeeServiceEntry[]>(`${this.baseUrl}/${serviceId}/employees`)
      .pipe(catchError(this.handleError));
  }

  // Upsert barber-specific entry (barber or owner)
  upsertBarberService(entry: Partial<EmployeeServiceEntry> & { service_id: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/employee`, entry)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Try to extract server error message
    const err = (error && error.error) ? (error.error.error || error.error) : error.message || error;
    return throwError(() => err);
  }
}
