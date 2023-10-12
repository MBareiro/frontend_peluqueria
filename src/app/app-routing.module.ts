import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../app/components/home/home.component'; 
import { LoginComponent } from '../app/components/login/login.component'; 
import { CreateAppointmentComponent } from './components/appointment/create-appointment/create-appointment.component'; 
import { DashboardNavigationComponent } from '../app/components/dashboard-navigation/dashboard-navigation.component'; 
import { ErrorPageComponent } from './components/shared/error-page/error-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent},  
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardNavigationComponent },
  { path: 'error-page', component: ErrorPageComponent },
  { path: 'create-turn', component: CreateAppointmentComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
