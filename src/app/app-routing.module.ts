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

const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardNavigationComponent },
  { path: 'error-page', component: ErrorPageComponent },
  { path: 'create-turn', component: CreateAppointmentComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'cancel-appointment/:id', component: CancelAppointmentComponent },
  { path: 'appointment-cancelled', component: AppointmentCancelledComponent },
  { path: '**', component: ErrorPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
