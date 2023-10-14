import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { AppointmentService } from '../../../services/appointment.service';
import { BehaviorSubject } from 'rxjs';

// TODO: Replace this with your own data model type
export interface ListAppointmentItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  peluquero: number;
  date: string; // O podrías usar un tipo Date si es más adecuado
  schedule: string;
  selectedRadio: string;
}

const EXAMPLE_DATA: ListAppointmentItem[] = [];

export class ListAppointmentDataSource extends DataSource<ListAppointmentItem> {
  data: ListAppointmentItem[] = EXAMPLE_DATA;
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  private dataSubject: BehaviorSubject<ListAppointmentItem[]> = new BehaviorSubject<ListAppointmentItem[]>([]);

  private selectedRadio: string;
  private selectedDate: string;

  constructor(private appointmentService: AppointmentService, selectedRadio: string, selectedDate: string) {
    super();
    this.selectedRadio = selectedRadio;
    this.selectedDate = selectedDate;
  }

  update(selectedRadio: string, selectedDate: string) {
    this.selectedRadio = selectedRadio;
    this.selectedDate = selectedDate;
  
    // Log para verificar los datos
    console.log('Selected Radio:', selectedRadio);
    console.log('Selected Date:', selectedDate);
  
    this.connect().subscribe(); // Actualiza la conexión con la nueva selección
  }
  
 
  connect(): Observable<ListAppointmentItem[]> {
    if (this.paginator && this.sort) {
      const userId = localStorage.getItem('userId');
      if (userId !== null) {
        // Si userId no es null, lo convertimos a número
        const userIdNumber = +userId;
        console.log(this.selectedDate)
        console.log(this.selectedRadio)
        const obs = this.appointmentService.getSelectedAppointments(this.selectedRadio, userIdNumber, this.selectedDate).pipe(
          map(data => this.getPagedData(this.getSortedData([...data])))
        );
  
        obs.subscribe(data => {
          console.log('Data from service:', data);  // Log para verificar los datos
          this.data = data;
          this.paginator!.length = data.length;  // Asegura que el paginador tenga la longitud correcta
          this.dataSubject.next(data);  // Notifica a los observadores de cambios en los datos
        });
      
        return merge(this.dataSubject.asObservable(), this.paginator.page, this.sort.sortChange)
          .pipe(map(() => {
            return this.getPagedData(this.getSortedData([...this.data]));
          }));
      } else {
        console.log("else")/* 
        // Si userId es null, maneja esta situación según tu lógica
        // Por ejemplo, podrías mostrar un mensaje de error o asignar un valor predeterminado para userId
        // Aquí asumiremos un valor predeterminado de 0
        const obs = this.appointmentService.get_selected_appointments(this.selectedRadio, this.selectedDate, userIdNumber).pipe(
          map(data => this.getPagedData(this.getSortedData([...data])))
        );
  
        obs.subscribe(data => this.dataSubject.next(data));
   */
        return merge(this.dataSubject.asObservable(), this.paginator.page, this.sort.sortChange)
          .pipe(map(() => {
            return this.getPagedData(this.getSortedData([...this.dataSubject.value]));
          }));
      }
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }
  
   

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ListAppointmentItem[]): ListAppointmentItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ListAppointmentItem[]): ListAppointmentItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }
    //Ordenamientos en la tabla
    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'selectedRadio': return compare(+a.selectedRadio, +b.selectedRadio, isAsc);
      /*   case 'firstName': return compare(a.firstName, b.firstName, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc); */
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
