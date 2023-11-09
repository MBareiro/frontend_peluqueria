import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class BloquedDayService {
  private apiUrl = environment.URL;
  constructor(private http: HttpClient){}

  createBlockedDayRange(start: string, end: string, user_id: number): Observable<any> {
    return this.http.post(this.apiUrl + "/create-blocked-day-range", { start_date: start, end_date: end, user_id: user_id });
  }  

  getBlockedDays(user_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-blocked-days/${user_id}`);
  }
  
  deleteBlockedDay(user_id: number): Observable<any> {
    const url = `${this.apiUrl}/delete-blocked-day`;
    const data = { user_id }; // Crear un objeto con el campo "user_id"
    return this.http.delete(url, { body: data });
  }

}


