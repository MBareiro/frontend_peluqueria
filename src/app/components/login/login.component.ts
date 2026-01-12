import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide3 = true;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private notification: NotificationService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {    
    try {
  const response: any = await this.authService.login(this.loginForm.value);
      let userRole: string | null = null;
      
      // Store values as strings if present. If the backend does not return
      // profile info (because we use httpOnly cookie), fetch /me as fallback.
      if (response && response.userId) {
        // store authenticated user in-memory only (no localStorage for id/name/role)
        userRole = response.userRole || null;
        this.authService.setCurrentUser({ id: response.userId, name: response.userName || '', role: userRole });
        // Also store role in localStorage for guards
        if (userRole) {
          localStorage.setItem('user_role', userRole);
        }
      } else {
        // Fallback: fetch authenticated profile from server which reads the httpOnly cookie
        try {
          const me: any = await this.authService.getMe();
          if (me) {
            userRole = me.role_obj?.name || me.role || null;
            this.authService.setCurrentUser({ id: me.id || me.userId, name: me.first_name ? `${me.first_name} ${me.last_name}` : (me.name || ''), role: userRole });
            if (userRole) {
              localStorage.setItem('user_role', userRole);
            }
            // Store tenant subdomain for multi-tenant requests
            if (me.tenant_subdomain) {
              localStorage.setItem('tenant_subdomain', me.tenant_subdomain);
            }
          }
        } catch (meErr) {
          console.warn('Could not fetch /me after login', meErr);
        }
      }
      
      // Redirect based on role
      if (userRole === 'super_admin') {
        this.router.navigate(['/super-admin']);
      } else {
        this.router.navigate(['/dashboard/list-appointment']);
      }
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : (err?.message || 'Error en el inicio de sesión');
      this.notification.showError(errMsg, 'Error de autenticación');
    }
  } 

}
