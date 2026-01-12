import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { firstValueFrom, BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /* login(username: string, password: string): Observable<any> {
    const body = { email: username, password: password };
    return this.http.post(`${this.baseUrl}/login`, body);
  } */

  login(formValue: any) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/login`, formValue)
    );
  }

  /**
   * Fetch authenticated user's profile from the server.
   * Backend exposes /api/users/me and uses the httpOnly cookie for auth.
   */
  getMe() {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/me`));
  }

  /** Initialize auth by attempting to fetch /me. Used by APP_INITIALIZER. */
  init(): Promise<any> {
    return this.getMe()
      .then((me) => {
        if (me) {
          // Extract role from role_obj if available, fallback to role string
          const roleName = me.role_obj?.name || me.role || me.userRole;
          // normalize to { id, name, role }
          const user = { 
            id: me.id || me.userId, 
            name: me.first_name ? `${me.first_name} ${me.last_name}` : (me.name || ''), 
            role: roleName 
          };
          this.setCurrentUser(user);
          // Store tenant subdomain for multi-tenant requests
          if (me.tenant_subdomain) {
            localStorage.setItem('tenant_subdomain', me.tenant_subdomain);
          }
        } else {
          this.setCurrentUser(null);
        }
      })
      .catch(() => {
        // not authenticated or /me failed — treat as anonymous
        this.setCurrentUser(null);
        return Promise.resolve();
      });
  }

  setCurrentUser(user: any | null) {
    this.currentUserSubject.next(user);
    try {
      // expose minimal global for non-DI helper usage (temporary bridge)
      (window as any).currentUser = user;
    } catch (e) {}
  }

  clearCurrentUser() {
    this.currentUserSubject.next(null);
    try { (window as any).currentUser = null; } catch (e) {}
  }

  /** Synchronous access to current user value (useful for guards) */
  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  isOwnerSync(): boolean {
    return !!(this.currentUserValue && this.currentUserValue.role === 'owner');
  }

  /** Simple authorization helper used in some components; checks current user */
  authorized() {
    const u = this.currentUserValue;
    if (!u || !u.id) {
      this.router.navigate(['/error-page']);
    }
  }
  
  logout(): Observable<any> {
    // Call backend to clear cookie, and clear in-memory state and any localStorage leftovers
    this.clearCurrentUser();
    localStorage.removeItem('userRole');
    localStorage.removeItem('tenant_subdomain');
    // Keep userId/name if other code relies on them; you can remove them if desired
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
  
}
