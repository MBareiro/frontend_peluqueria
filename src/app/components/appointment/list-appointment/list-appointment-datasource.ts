import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

export interface ListAppointmentItem {
  id: number;
  time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  client_id: number;
  hairdresser_id: number;
  service_id: number;
  date: string; 
  schedule: string;
  status: string;
  cancellation_token?: string;
}

const EXAMPLE_DATA: ListAppointmentItem[] = [];

export class ListAppointmentDataSource extends DataSource<ListAppointmentItem> {
  data: ListAppointmentItem[] = EXAMPLE_DATA;
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  private dataSubject: BehaviorSubject<ListAppointmentItem[]> = new BehaviorSubject<ListAppointmentItem[]>([]);

  private selectedRadio: string;
  private selectedDate: string;

  constructor(private appointmentService: AppointmentService, selectedRadio: string, selectedDate: string, private authService?: AuthService) {
    super();
    this.selectedRadio = selectedRadio;
    this.selectedDate = selectedDate;    
  }

  update(selectedRadio: string, selectedDate: string) {
    this.selectedRadio = selectedRadio;
    this.selectedDate = selectedDate;
    this.connect().subscribe(); // Actualiza la conexión con la nueva selección
  }
   
  connect(): Observable<ListAppointmentItem[]> {
    if (this.paginator && this.sort) {
      // Prefer AuthService in-memory user; fallback to temporary window bridge then localStorage
      const userIdFromAuth = this.authService?.currentUserValue?.id ? String(this.authService!.currentUserValue.id) : null;
      const globalUser = (window as any).currentUser;
      const userIdFromGlobal = globalUser?.id ? String(globalUser.id) : null;
      const userId = userIdFromAuth ?? userIdFromGlobal ?? localStorage.getItem('userId');
      if (userId !== null) {
        const userIdNumber = +userId;
        this.appointmentService.getSelectedAppointments(this.selectedRadio, userIdNumber, this.selectedDate).then((data: any) => {
          // Mapear los datos para aplanar el objeto client
          const mappedData = data.map((appointment: any) => ({
            id: appointment.id,
            time: appointment.time,
            first_name: appointment.client?.first_name || '',
            last_name: appointment.client?.last_name || '',
            email: appointment.client?.email || '',
            phone_number: appointment.client?.phone_number || '',
            client_id: appointment.client_id,
            date: appointment.date,
            schedule: appointment.schedule,
            status: appointment.status,
            hairdresser_id: appointment.hairdresser_id,
            service_id: appointment.service_id,
            cancellation_token: appointment.cancellation_token
          }));
          
          const sortedData = this.getSortedData([...mappedData]);
          const pagedData = this.getPagedData(sortedData);
        
          this.data = pagedData;
          this.paginator!.length = mappedData.length;  // Longitud basada en datos mapeados, no paginados
          this.dataSubject.next(pagedData);  // Notifica a los observadores de cambios en los datos
        });
        
      
        return merge(this.dataSubject.asObservable(), this.paginator.page, this.sort.sortChange)
          .pipe(map(() => {
            return this.getPagedData(this.getSortedData([...this.data]));
          }));
      } else {/* 
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
        case 'time': return compare(a.time, b.time, isAsc);
        case 'first_name': return compare(a.first_name, b.first_name, isAsc);
        case 'email': return compare(a.email, b.email, isAsc);
        case 'phone_number': return compare(a.phone_number, b.phone_number, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
