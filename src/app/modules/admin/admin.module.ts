import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../../shared/material.module';

// Admin components
import { AdminListComponent } from '../../components/admin/admin-list.component';
import { UserListComponent } from '../../components/user/user-list/user-list.component';
import { UserCreateComponent } from '../../components/user/user-create/user-create.component';
import { ServicesComponent } from '../../components/services/services.component';
import { MyServicesComponent } from '../../components/services/my-services.component';
import { ScheduleComponent } from '../../components/schedule/schedule.component';
import { ServiceCreateDialogComponent } from '../../components/service-create-dialog/service-create-dialog.component';
import { MapConfigComponent } from '../../components/admin/map-config/map-config.component';
import { BusinessConfigComponent } from '../../components/admin/business-config/business-config.component';
import { HomeCustomizationComponent } from '../../components/admin/home-customization/home-customization.component';

@NgModule({
  declarations: [
    AdminListComponent,
    UserListComponent,
    UserCreateComponent,
    ServicesComponent,
    MyServicesComponent,
    ScheduleComponent,
    ServiceCreateDialogComponent,
    MapConfigComponent,
    BusinessConfigComponent,
    HomeCustomizationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
