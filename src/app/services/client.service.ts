import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  
  
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClients(): Promise<Client[]> {
    return firstValueFrom(this.http.get<Client[]>(this.apiUrl ));
  }

  getClientById(id: number): Promise<Client> {
    return firstValueFrom(this.http.get<Client>(`${this.apiUrl}/${id}`));
  }

  addClient(Client: Client) {
    return firstValueFrom(this.http.post(this.apiUrl, Client));
  }

  updateClient(Client: Client) {
    return firstValueFrom(this.http.put(`${this.apiUrl}/${Client.id}`, Client));
  }

  deleteClient(id: number) {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }

  getClientAppointments(clientId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/appointments/client-appointments/${clientId}`);
  }

  toggleClientBlockedStatus(clientId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${clientId}/block`, {});
  }
}
