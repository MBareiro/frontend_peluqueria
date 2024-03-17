import { Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListAppointmentDataSource, ListAppointmentItem } from './list-appointment-datasource';
import { AppointmentService } from '../../../services/appointment.service';
import { MatRadioChange } from '@angular/material/radio';
import { FormControl } from '@angular/forms';
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
  
  dateFilter = (date: Date) => {
    // Lógica para deshabilitar ciertos días, por ejemplo, deshabilitar los sábados y domingos
    const day = date.getDay();
    return day !== 0 && day !== 6; // Devuelve true para habilitar, false para deshabilitar
  };

  constructor(private appointmentService: AppointmentService) {
    this.dataSource = new ListAppointmentDataSource(this.appointmentService, this.selectedRadio, this.selectedDate);
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['selectedRadio','first_name', 'last_name', 'email', 'phone_number', 'actions'];/* 
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
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;  
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.getRangeLabel = this.getRangeLabel.bind(this);
  
    this.dataSource.update(this.selectedRadio, this.selectedDate);   
      
    this.table.dataSource = this.dataSource;
    this.dataSource.connect();
  }
  

  //Personalizar la etiqueta rango (0 of 0)
  getRangeLabel(page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }
  
  eliminarTurno(id : number){
    this.appointmentService.userCancelAppointment(id).subscribe(
      (response) => {
        console.log('Turno eliminado exitosamente', response);
        // Llama a connect para actualizar la fuente de datos con la nueva selección
      this.dataSource.connect();
        // Actualiza la lista de turnos o realiza alguna acción adicional si es necesario
      },
      (error) => {
        console.error('Error al eliminar turno', error);
        // Maneja el error de acuerdo a tus necesidades
      }
    );
  }
}
