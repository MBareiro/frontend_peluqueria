import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../app/components/home/home.component'; 
import { LoginComponent } from '../app/components/login/login.component'; 
import { CreateTurnComponent } from '../app/components/create-turn/create-turn.component'; 
import { DashboardComponent } from '../app/components/dashboard/dashboard.component'; 

const routes: Routes = [
  { path: '', component: HomeComponent},  
  { path: 'login', component: LoginComponent },
  { path: 'create-turn', component: CreateTurnComponent },
  { path: 'dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
