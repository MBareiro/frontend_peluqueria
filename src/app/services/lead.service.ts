import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Lead {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  source: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  success: boolean;
  count: number;
  leads: Lead[];
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getAllLeads(status?: string, limit?: number): Observable<LeadsResponse> {
    let params = new HttpParams();
    
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<LeadsResponse>(this.apiUrl, { params });
  }

  updateLeadStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}
