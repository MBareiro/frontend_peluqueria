import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../app/components/home/home.component'; 
import { LoginComponent } from '../app/components/login/login.component'; 
import { CreateTurnComponent } from '../app/components/create-turn/create-turn.component'; 
import { DashboardNavigationComponent } from '../app/components/dashboard-navigation/dashboard-navigation.component'; 
import { DashboardUserComponent } from './components/user/dashboard-user/dashboard-user.component';

const routes: Routes = [
  { path: '', component: HomeComponent},  
  { path: 'login', component: LoginComponent },
  { path: 'create-turn', component: CreateTurnComponent },
  { path: 'dash', component: DashboardNavigationComponent },
  { path: 'dashboard-user', component: DashboardUserComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
