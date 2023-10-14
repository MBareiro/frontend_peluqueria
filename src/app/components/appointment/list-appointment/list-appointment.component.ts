import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListAppointmentDataSource, ListAppointmentItem } from './list-appointment-datasource';
import { AppointmentService } from '../../../services/appointment.service';
import { MatRadioChange } from '@angular/material/radio';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-list-appointment',
  templateUrl: './list-appointment.component.html',
  styleUrls: ['./list-appointment.component.css']
})
export class ListAppointmentComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ListAppointmentItem>;
  @ViewChild('datepicker') datepicker!: MatDatepicker<any>;
  dataSource: ListAppointmentDataSource;
  selectedRadio = 'morning';  // Default selection
  selectedDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');  // Inicializa con la fecha de hoy en formato 'yyyy-MM-dd'
  date = new FormControl(new Date());
  //serializedDate = new FormControl(new Date().toISOString());
  
  constructor(private appointmentService: AppointmentService) {
    this.dataSource = new ListAppointmentDataSource(this.appointmentService, this.selectedRadio, this.selectedDate);
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['selectedRadio','first_name', 'last_name', 'email', 'phone_number'];/* 
  displayedColumns = ['selectedRadio','first_name', 'last_name', 'email', 'phone_number', 'peluquero']; */

  onRadioChange(event: MatRadioChange) {
    this.selectedRadio = event.value || 'morning';  // Update selectedRadio
    this.dataSource.update(this.selectedRadio, this.selectedDate);  // Update the data source
 
  }
  
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const selectedDate: Date | null = event.value;
  
    if (selectedDate) {
      // Convertir la fecha al formato 'yyyy-MM-dd'
      const dateString: string = formatDate(selectedDate, 'yyyy-MM-dd', 'en-US');
      this.selectedDate = dateString
      this.dataSource.update(this.selectedRadio, this.selectedDate);
  
      // Limpiar la tabla estableciendo la fuente de datos como un arreglo vacío
      /* this.table.dataSource = []; */
  
      // Llamar a connect para actualizar la fuente de datos con la nueva fecha
      this.dataSource.connect();
    }
  }
  
   
  

  ngAfterViewInit(): void {
    // Configura el paginador y la ordenación en la fuente de datos
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  
    // Llama a update con la fecha de hoy y el valor seleccionado por defecto (morning)
    this.dataSource.update(this.selectedRadio, this.selectedDate);   
    
    // Establecer la fuente de datos en la tabla después de configurar paginador y ordenación
    this.table.dataSource = this.dataSource;
  
    // Llamar a connect después de establecer el paginador y la ordenación
    this.dataSource.connect();
  }
  
  
}
