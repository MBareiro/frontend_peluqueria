import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AccountRoutingModule } from './account-routing.module';
import { MaterialModule } from '../../shared/material.module';

// Account components
import { ChangePasswordComponent } from '../../components/account/change-password/change-password.component';
import { ProfileComponent } from '../../components/account/profile/profile.component';

@NgModule({
  declarations: [
    ChangePasswordComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
