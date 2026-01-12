import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListAppointmentComponent } from '../../components/appointment/list-appointment/list-appointment.component';
import { CancelAppointmentsComponent } from '../../components/appointment/cancel-appointments/cancel-appointments.component';
import { CreateAppointmentComponent } from '../../components/appointment/create-appointment/create-appointment.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'list', component: ListAppointmentComponent },
      { path: 'calendar', component: CancelAppointmentsComponent },
      { path: 'create', component: CreateAppointmentComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
