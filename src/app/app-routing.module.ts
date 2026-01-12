import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../app/components/home/home.component';
import { LoginComponent } from '../app/components/login/login.component';
import { CreateAppointmentComponent } from './components/appointment/create-appointment/create-appointment.component';
import { DashboardNavigationComponent } from '../app/components/dashboard-navigation/dashboard-navigation.component';
import { ErrorPageComponent } from './components/shared/error-page/error-page.component';
import { ForgotPasswordComponent } from './components/account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/account/reset-password/reset-password.component';
import { CancelAppointmentComponent } from './components/appointment/cancel-appointment/cancel-appointment.component';
import { AppointmentCancelledComponent } from './components/appointment/appointment-cancelled/appointment-cancelled.component';
import { loginGuard } from './guards/login.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { SuperAdminDashboardComponent } from './components/admin/super-admin-dashboard/super-admin-dashboard.component';
import { TenantListComponent } from './components/admin/tenant-list/tenant-list.component';
import { TenantDetailsComponent } from './components/admin/tenant-details/tenant-details.component';
import { BillingListComponent } from './components/admin/billing-list/billing-list.component';
import { LandingPageComponent } from './components/shared/landing-page/landing-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  
  // Public appointment routes (for guests without login)
  { path: 'create-appointment', component: CreateAppointmentComponent },
  { path: 'cancel-appointment/:id', component: CancelAppointmentComponent },
  { path: 'appointment-cancelled', component: AppointmentCancelledComponent },
  
  // Password recovery routes
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  
  // Dashboard with lazy-loaded modules
  {
    path: 'dashboard',
    component: DashboardNavigationComponent,
    canActivate: [loginGuard],
    children: [
      // Legacy route redirects for backward compatibility
      { path: 'list-appointment', redirectTo: '/dashboard/appointments/list', pathMatch: 'full' },
      { path: 'calendar', redirectTo: '/dashboard/appointments/calendar', pathMatch: 'full' },
      
      { path: 'list-users', redirectTo: '/dashboard/admin/list-users', pathMatch: 'full' },
      { path: 'create-user', redirectTo: '/dashboard/admin/create-user', pathMatch: 'full' },
      { path: 'services', redirectTo: '/dashboard/admin/services', pathMatch: 'full' },
      { path: 'my-services', redirectTo: '/dashboard/admin/my-services', pathMatch: 'full' },
      { path: 'schedule', redirectTo: '/dashboard/admin/schedule', pathMatch: 'full' },
      
      { path: 'list-clients', redirectTo: '/dashboard/clients/list', pathMatch: 'full' },
      { path: 'info-client/:id', redirectTo: '/dashboard/clients/info/:id', pathMatch: 'full' },
      
      { path: 'change-password', redirectTo: '/dashboard/account/change-password', pathMatch: 'full' },
      { path: 'profile', redirectTo: '/dashboard/account/profile', pathMatch: 'full' },
      
      // Lazy-loaded modules
      {
        path: 'appointments',
        loadChildren: () => import('./modules/appointment/appointment.module').then(m => m.AppointmentModule),
        canActivate: [loginGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        canActivate: [loginGuard]
      },
      {
        path: 'clients',
        loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule),
        canActivate: [loginGuard]
      },
      {
        path: 'account',
        loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
        canActivate: [loginGuard]
      },
    ],
  },
  
  // Super Admin Routes (outside dashboard)
  {
    path: 'super-admin',
    canActivate: [SuperAdminGuard],
    children: [
      { path: '', component: SuperAdminDashboardComponent },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/:id', component: TenantDetailsComponent },
      { path: 'billing', component: BillingListComponent },
    ]
  },
  
  // Error handling
  { path: 'error-page', component: ErrorPageComponent },
  { path: '**', component: ErrorPageComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
