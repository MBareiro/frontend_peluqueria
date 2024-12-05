import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListClientDataSource, ListClientItem } from './list-clients-datasource';
import { ClientService } from '../../../services/client.service';
import { MatRadioChange } from '@angular/material/radio';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-list-clients',
  templateUrl: './list-clients.component.html',
  styleUrls: ['./list-clients.component.css']
})
export class ListClientsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ListClientItem>;
  dataSource: ListClientDataSource;
  time = 'morning';  // Selección por defecto
  selectedDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');  // Inicializa con la fecha de hoy en formato 'yyyy-MM-dd'
  date = new FormControl(new Date());
  searchInput: string = ''; // Término de búsqueda

  constructor(private clientService: ClientService) {
    this.dataSource = new ListClientDataSource(this.clientService);
  }

  displayedColumns = ['id', 'full_name', 'email', 'phone_number', 'actions'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Escucha el evento de cambio de página del paginador y del sort
    this.paginator.page.subscribe(() => this.dataSource.connect());
    this.sort.sortChange.subscribe(() => this.dataSource.connect());

    this.dataSource.update();
    this.table.dataSource = this.dataSource;
  }

  applyFilter(): void {
    const filterValue = this.searchInput.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.dataSource.paginator?.firstPage();
  }

  onRadioChange(event: MatRadioChange): void {
    this.time = event.value || 'morning';
    this.dataSource.update();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate: Date | null = event.value;
    if (selectedDate) {
      const dateString = formatDate(selectedDate, 'yyyy-MM-dd', 'en-US');
      this.selectedDate = dateString;
      this.dataSource.update();
    }
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
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
}
