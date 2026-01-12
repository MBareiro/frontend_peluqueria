import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ClientRoutingModule } from './client-routing.module';
import { MaterialModule } from '../../shared/material.module';

// Client components
import { ListClientsComponent } from '../../components/client/list-clients/list-clients.component';
import { InfoClientComponent } from '../../components/client/info-client/info-client.component';

@NgModule({
  declarations: [
    ListClientsComponent,
    InfoClientComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    ClientRoutingModule
  ]
})
export class ClientModule { }
