import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-navigation',
  templateUrl: './dashboard-navigation.component.html',
  styleUrls: ['./dashboard-navigation.component.css'],
})

export class DashboardNavigationComponent {
  private breakpointObserver = inject(BreakpointObserver);
  userName: string | null;
  userRole: string | null;
  showEmail = false;
  showChangePassword = false;
  showCreateAppointment = false;
  showSchudule = false;
  showUserList = false;
  showUserAdd = false;
  showListAppointment = true;
  showProfile = false;
  showCancelAppointments = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private authService: AuthService, private router: Router) {
    this.userName = localStorage.getItem('userName');
    this.userRole = localStorage.getItem('userRole');    
    authService.authorized();
  }

  private resetViews() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showCreateAppointment = false;
    this.showSchudule = false;
    this.showUserList = false;
    this.showUserAdd = false;
    this.showListAppointment = false;
    this.showProfile = false;
    this.showCancelAppointments = false;
  }

  showComponent(componentName: string) {
    this.resetViews();

    switch (componentName) {
      case 'email':
        this.showEmail = true;
        break;
      case 'password':
        this.showChangePassword = true;
        break;
      case 'createAppointment':
        this.showCreateAppointment = true;
        break;
      case 'schedule':
        this.showSchudule = true;
        break;
      case 'userList':
        this.showUserList = true;
        break;
      case 'userAdd':
        this.showUserAdd = true;
        break;
      case 'listAppointment':
        this.showListAppointment = true;
        break;
      case 'profile':
        this.showProfile = true;
        break;
      case 'cancelAppointments':
        this.showCancelAppointments = true;
        break;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);  // Redirigir a la página de inicio de sesión
  }
}
