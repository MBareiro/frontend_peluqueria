import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ScheduleComponent } from '../schedule/schedule.component';
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
    console.log(this.userName)
    if(!this.userName){
      this.router.navigate(['/error-page']);
    }
  }

  private breakpointObserver = inject(BreakpointObserver);
  showCreateAppointment = true; // Mostrar el componente "Crear Appointmento" de forma predeterminada
  showSchudule = false;
  showUserList= false;
  showUserAdd= false;
  showListAppointment= false;

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

  showAppointmentComponent() {
    this.showCreateAppointment = true;
    this.showSchudule = false;    
    this.showUserList = false;  
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  showCreateAppointmentComponent(){
    this.showCreateAppointment = true;
    this.showSchudule = false;    
    this.showUserList = false;  
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }

  showSchuduleComponent() {
    this.showCreateAppointment = false;
    this.showSchudule = true;    
    this.showUserList = false; 
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  
  showUserListComponent() {
    this.showCreateAppointment = false;
    this.showUserList = true;
    this.showSchudule = false;       
    this.showUserAdd = false; 
    this.showListAppointment = false;
  }
  
  showUserAddComponent() {
    this.showCreateAppointment = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = true;
    this.showListAppointment = false;
  }
  showListAppointmentComponent() {
    this.showCreateAppointment = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = false;
    this.showListAppointment = true;
  }
}
