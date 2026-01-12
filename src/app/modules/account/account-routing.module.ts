import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from '../../components/account/change-password/change-password.component';
import { ProfileComponent } from '../../components/account/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
