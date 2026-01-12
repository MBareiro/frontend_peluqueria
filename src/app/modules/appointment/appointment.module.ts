import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { MaterialModule } from '../../shared/material.module';

// Appointment components (dashboard-only, protected by loginGuard)
import { ListAppointmentComponent } from '../../components/appointment/list-appointment/list-appointment.component';
import { CancelAppointmentsComponent } from '../../components/appointment/cancel-appointments/cancel-appointments.component';
import { CreateAppointmentComponent } from '../../components/appointment/create-appointment/create-appointment.component';

@NgModule({
  declarations: [
    ListAppointmentComponent,
    CancelAppointmentsComponent,
    CreateAppointmentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AppointmentRoutingModule
  ]
})
export class AppointmentModule { }
