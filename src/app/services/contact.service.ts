import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  business_name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface ContactResponse {
  message: string;
  lead: {
    id: number;
    business_name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  submitContact(data: ContactFormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data);
  }
}
