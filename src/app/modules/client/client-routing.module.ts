import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListClientsComponent } from '../../components/client/list-clients/list-clients.component';
import { InfoClientComponent } from '../../components/client/info-client/info-client.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'list', component: ListClientsComponent },
      { path: 'info/:id', component: InfoClientComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
