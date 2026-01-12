import { Component, inject, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BusinessConfigService } from '../../services/business-config.service';
import { BusinessConfig } from '../../models/business-config.model';

@Component({
  selector: 'app-dashboard-navigation',
  templateUrl: './dashboard-navigation.component.html',
  styleUrls: ['./dashboard-navigation.component.css'],
})

export class DashboardNavigationComponent implements OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();
  userName: string | null = null;
  userRole: string | null = null;
  isOwner = false;
  businessConfig$: Observable<BusinessConfig | null>;
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

  constructor(
    private authService: AuthService, 
    private router: Router,
    private businessConfigService: BusinessConfigService
  ) {
    // Subscribe to current user populated by APP_INITIALIZER
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userName = user?.name || null;
        this.userRole = user?.role_obj?.name || user?.role || null;
        this.isOwner = (user?.role_obj?.name || user?.role) === 'owner';
      });
    this.authService.authorized();
    
    // Subscribe to business config
    this.businessConfig$ = this.businessConfigService.config$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
