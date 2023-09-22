import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-appointment',
  templateUrl: './dashboard-appointment.component.html',
  styleUrls: ['./dashboard-appointment.component.css'],
})
export class DashboardAppointmentComponent {
  private breakpointObserver = inject(BreakpointObserver);

  showCreateAppointment = true;
  showListAppointment = false;
  /* 
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );  
 */
  showListAppointmentComponent() {
    this.showCreateAppointment = false;
    this.showListAppointment = true;
  }
  showCreateAppointmentComponent() {
    this.showCreateAppointment = true;
    this.showListAppointment = false;
  }
}
