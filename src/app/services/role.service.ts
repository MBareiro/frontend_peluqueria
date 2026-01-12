import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Role {
  id: number;
  name: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  async getRoles(): Promise<Role[]> {
    try {
      return await firstValueFrom(this.http.get<Role[]>(this.baseUrl));
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  async getRoleById(id: number): Promise<Role | null> {
    try {
      return await firstValueFrom(this.http.get<Role>(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error fetching role:', error);
      return null;
    }
  }
}
