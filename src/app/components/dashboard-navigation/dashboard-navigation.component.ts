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
  userName: string | null;
  constructor(private authService: AuthService, private router: Router) {
    this.userName = localStorage.getItem('userName');
    authService.authorized()
  }

  private breakpointObserver = inject(BreakpointObserver);
  showCreateAppointment = true; // Mostrar el componente "Crear Appointmento" de forma predeterminada
  showSchudule = false;
  showUserList= false;
  showUserAdd= false;
  showListAppointment= false;
  showChangePassword = false;
  showProfile = false;
  showEmail = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );  

    logout() {
      this.authService.logout();
      this.router.navigate(['/']);  // Redirigir a la página de inicio de sesión
    }

    showEmailComponent(){
      this.showEmail = true;
      this.showProfile = false;
      this.showChangePassword = false;
      this.showCreateAppointment = false;
      this.showSchudule = false;    
      this.showUserList = false;  
      this.showUserAdd = false; 
      this.showListAppointment = false;
    }

    showProfileComponent() {
      this.showEmail = false;
      this.showProfile = true;
      this.showChangePassword = false;
      this.showCreateAppointment = false;
      this.showSchudule = false;    
      this.showUserList = false;  
      this.showUserAdd = false; 
      this.showListAppointment = false;
    }
    showChangePasswordComponent() {
      this.showEmail = false;
      this.showProfile = false;
      this.showChangePassword = true;
      this.showCreateAppointment = false;
      this.showSchudule = false;    
      this.showUserList = false;  
      this.showUserAdd = false; 
      this.showListAppointment = false;
    }
  showAppointmentComponent() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = true;
    this.showSchudule = false;    
    this.showUserList = false;  
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  showCreateAppointmentComponent(){
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = true;
    this.showSchudule = false;    
    this.showUserList = false;  
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }

  showSchuduleComponent() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = false;
    this.showSchudule = true;    
    this.showUserList = false; 
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  
  showUserListComponent() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = false;
    this.showUserList = true;
    this.showSchudule = false;       
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  
  showUserAddComponent() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = true;
    this.showListAppointment = false;
  }
  showListAppointmentComponent() {
    this.showEmail = false;
    this.showChangePassword = false;
    this.showProfile = false;
    this.showCreateAppointment = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = false;
    this.showListAppointment = true;
  }
}
