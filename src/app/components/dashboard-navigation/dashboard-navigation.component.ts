import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-navigation',
  templateUrl: './dashboard-navigation.component.html',
  styleUrls: ['./dashboard-navigation.component.css'],
})
export class DashboardNavigationComponent {
  private breakpointObserver = inject(BreakpointObserver);
  showCreateTurn = true; // Mostrar el componente "Crear Turno" de forma predeterminada
  showSchudule = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );  

  showTurnComponent() {
    console.log("asdas")
    this.showCreateTurn = true;
    this.showSchudule = false;
  }

  showSchuduleComponent() {
    this.showCreateTurn = false;
    this.showSchudule = true;
  }
}
