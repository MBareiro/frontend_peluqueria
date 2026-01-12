import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MercadopagoService {
  private base = `${environment.apiUrl}/mercadopago`;
  constructor(private http: HttpClient) {}

  createPreference(body: { description: string; price: number; appointmentId: number; payer_email: string }): Observable<any> {
    return this.http.post<any>(`${this.base}/create-preference`, body, { withCredentials: true });
  }
}
