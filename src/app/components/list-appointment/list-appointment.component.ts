import { Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListAppointmentDataSource, ListAppointmentItem } from './list-appointment-datasource';
import { AppointmentService } from '../../services/appointment.service';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-list-appointment',
  templateUrl: './list-appointment.component.html',
  styleUrls: ['./list-appointment.component.css']
})
export class ListAppointmentComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ListAppointmentItem>;
  dataSource: ListAppointmentDataSource;
  selectedValue = 'morning';  // Default selection
  
  constructor(private appointmentService: AppointmentService) {
    this.dataSource = new ListAppointmentDataSource(this.appointmentService, this.selectedValue);
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['selectedRadio','first_name', 'last_name', 'email', 'phone_number', 'peluquero'];

  onRadioChange(event: MatRadioChange) {
    this.selectedValue = event.value || 'morning';  // Update selectedValue
    this.dataSource.update(this.selectedValue);  // Update the data source
    console.log(localStorage.getItem('userId') )
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  
    // Establecer la fuente de datos en la tabla después de configurar paginador y ordenación
    this.table.dataSource = this.dataSource;
  
    // Llamar a connect después de establecer el paginador y la ordenación
    this.dataSource.connect();
  }
  
}
