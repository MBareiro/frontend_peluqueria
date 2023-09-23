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
  }

  private breakpointObserver = inject(BreakpointObserver);
  showCreateTurn = true; // Mostrar el componente "Crear Turno" de forma predeterminada
  showSchudule = false;
  showUserList= false;
  showUserAdd= false;
  showAppointmentList= false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );  

    logout() {
      this.authService.logout();
      this.router.navigate(['/login']);  // Redirigir a la página de inicio de sesión
    }

  showTurnComponent() {
    this.showCreateTurn = true;
    this.showSchudule = false;    
    this.showUserList = false;  
    this.showUserAdd = false; 
    this.showAppointmentList = false;
  }

  showSchuduleComponent() {
    this.showCreateTurn = false;
    this.showSchudule = true;    
    this.showUserList = false; 
    this.showUserAdd = false; 
    this.showAppointmentList = false;
  }
  
  showUserListComponent() {
    this.showCreateTurn = false;
    this.showUserList = true;
    this.showSchudule = false;       
    this.showUserAdd = false; 
    this.showAppointmentList = false;
  }
  
  showUserAddComponent() {
    this.showCreateTurn = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = true;
    this.showAppointmentList = false;
  }
  showAppointmentListComponent() {
    this.showCreateTurn = false;
    this.showUserList = false;
    this.showSchudule = false;   
    this.showUserAdd = false;
    this.showAppointmentList = true;
  }
}
