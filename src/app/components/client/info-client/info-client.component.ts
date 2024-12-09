import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-info-client',
  templateUrl: './info-client.component.html',
  styleUrls: ['./info-client.component.css']
})
export class InfoClientComponent implements OnInit {
  clientId!: string;
  blocked!: boolean;
  appointments: any[] = [];
  displayedColumns: string[] = ['date', 'time', 'status', 'hairdresser'];

  constructor(private route: ActivatedRoute, private clientService: ClientService, private router: Router, private location: Location) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('id')!;
      this.route.queryParams.subscribe(queryParams => {
        this.blocked = queryParams['blocked'] === '1';
      });
      console.log(this.blocked);
      this.loadClientAppointments(this.clientId);
    });
  }

  loadClientAppointments(id: string): void {
    this.clientService.getClientAppointments(id).subscribe(response => {
      this.appointments = response.map((appointment: any) => ({
        ...appointment,
        date: new Date(appointment.date).toLocaleDateString(),
        status: this.translateStatus(appointment.status)
      }));
    }, error => {
      console.error('Error fetching client appointments:', error);
    });
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'absent':
        return 'Ausente';
      case 'programmed':
        return 'Programado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  goBack(): void {
    this.location.back();
  }

  blockClient(): void {
    this.clientService.toggleClientBlockedStatus(this.clientId, null, null).subscribe(response => {
      this.blocked = !this.blocked; // Toggle the blocked state
    }, error => {
      console.error('Error blocking client:', error);
    });
  }
}
