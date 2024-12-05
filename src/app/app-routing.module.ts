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
import { ListAppointmentComponent } from './components/appointment/list-appointment/list-appointment.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserCreateComponent } from './components/user/user-create/user-create.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ChangePasswordComponent } from './components/account/change-password/change-password.component';
import { CancelAppointmentsComponent } from './components/appointment/cancel-appointments/cancel-appointments.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { loginGuard } from './guards/login.guard';
import { ListClientsComponent } from './components/client/list-clients/list-clients.component';
import { InfoClientComponent } from './components/client/info-client/info-client.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardNavigationComponent,
    canActivate: [loginGuard],
    children: [
      { path: 'create-appointment', component: CreateAppointmentComponent },
      { path: 'list-appointment', component: ListAppointmentComponent },
      { path: 'list-users', component: UserListComponent },
      { path: 'create-user', component: UserCreateComponent },
      { path: 'list-clients', component: ListClientsComponent },
      { path: 'info-client/:id', component: InfoClientComponent },
      { path: 'schedule', component: ScheduleComponent },

      { path: 'calendar', component: CancelAppointmentsComponent },      
      { path: 'cancel-appointment/:id', component: CancelAppointmentComponent },
      { path: 'appointment-cancelled', component: AppointmentCancelledComponent },

      { path: 'change-password', component: ChangePasswordComponent },

      { path: 'profile', component: ProfileComponent },
      
    ],
  },
  { path: 'appointment-cancelled', component: AppointmentCancelledComponent },
  { path: 'cancel-appointment/:id', component: CancelAppointmentComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'create-appointment', component: CreateAppointmentComponent },
  { path: 'error-page', component: ErrorPageComponent },
  { path: '**', component: ErrorPageComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
