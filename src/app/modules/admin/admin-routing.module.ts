import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from '../../components/user/user-list/user-list.component';
import { UserCreateComponent } from '../../components/user/user-create/user-create.component';
import { ServicesComponent } from '../../components/services/services.component';
import { MyServicesComponent } from '../../components/services/my-services.component';
import { ScheduleComponent } from '../../components/schedule/schedule.component';
import { AdminListComponent } from '../../components/admin/admin-list.component';
import { MapConfigComponent } from '../../components/admin/map-config/map-config.component';
import { BusinessConfigComponent } from '../../components/admin/business-config/business-config.component';
import { HomeCustomizationComponent } from '../../components/admin/home-customization/home-customization.component';
import { MyBillingComponent } from '../../components/admin/my-billing/my-billing.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: AdminListComponent },
      { path: 'list-users', component: UserListComponent },
      { path: 'create-user', component: UserCreateComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'services-management', redirectTo: 'services', pathMatch: 'full' },
      { path: 'my-services', component: MyServicesComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'map-config', component: MapConfigComponent },
      { path: 'business-config', component: BusinessConfigComponent },
      { path: 'home-customization', component: HomeCustomizationComponent },
      { path: 'my-billing', component: MyBillingComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
