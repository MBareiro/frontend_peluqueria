import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListAppointmentDataSource, ListAppointmentItem } from './list-appointment-datasource';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { MatRadioChange } from '@angular/material/radio';
import { FormControl } from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import { ClientService } from 'src/app/services/client.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-list-appointment',
  templateUrl: './list-appointment.component.html',
  styleUrls: ['./list-appointment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAppointmentComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ListAppointmentItem>;
  @ViewChild('datepicker') datepicker!: MatDatepicker<any>;
  dataSource: ListAppointmentDataSource;
  time = 'morning';  // Default selection
  selectedDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');  // Inicializa con la fecha de hoy en formato 'yyyy-MM-dd'
  date = new FormControl(new Date());
  
  // Contadores para indicadores visuales
  totalAppointments = 0;
  morningCount = 0;
  afternoonCount = 0;
  //serializedDate = new FormControl(new Date().toISOString());
  
  dateFilter = (date: Date) => {
    // Lógica para deshabilitar ciertos días, por ejemplo, deshabilitar los sábados y domingos
    const day = date.getDay();
    return day !== 0 && day !== 6; // Devuelve true para habilitar, false para deshabilitar
  };

  constructor(private appointmentService: AppointmentService, private clientService: ClientService, private snackBar: MatSnackBar, private authService: AuthService) {
    this.dataSource = new ListAppointmentDataSource(this.appointmentService, this.time, this.selectedDate, this.authService);
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['time','first_name', 'email', 'phone_number', 'status', 'actions'];

  onRadioChange(event: MatRadioChange) {
    this.time = event.value || 'morning';  // Update time
    this.dataSource.update(this.time, this.selectedDate);  // Update the data source
    this.updateCounters();
  }  
  
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const selectedDate: Date | null = event.value;
  
    if (selectedDate) {
      // Convertir la fecha al formato 'yyyy-MM-dd'
      const dateString  = formatDate(selectedDate, 'yyyy-MM-dd', 'en-US');
      this.selectedDate = dateString
      this.dataSource.update(this.time, this.selectedDate);
  
      // Limpiar la tabla estableciendo la fuente de datos como un arreglo vacío
      /* this.table.dataSource = []; */
  
      // Llamar a connect para actualizar la fuente de datos con la nueva fecha
      this.dataSource.connect();
      this.updateCounters();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;  
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.getRangeLabel = this.getRangeLabel.bind(this);
  
    this.dataSource.update(this.time, this.selectedDate);   
      
    this.table.dataSource = this.dataSource;
    this.dataSource.connect();
    
    // Actualizar contadores después de cargar datos
    this.updateCounters();
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
  
  // Actualizar contadores de turnos
  updateCounters() {
    setTimeout(() => {
      const allData = this.dataSource.data;
      
      // Solo contar turnos programados (activos/confirmados)
      const programmedOnly = allData.filter(a => a.status === 'programmed');
      
      this.totalAppointments = programmedOnly.length;
      this.morningCount = programmedOnly.filter(a => a.schedule === 'morning').length;
      this.afternoonCount = programmedOnly.filter(a => a.schedule === 'afternoon').length;
    }, 300);
  }
  
  // Obtener clase CSS según el estado
  getStatusClass(status: string): string {
    switch (status) {
      case 'programmed':
        return 'status-programmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'absent':
        return 'status-absent';
      case 'paid':
        return 'status-paid';
      case 'pending_payment':
        return 'status-pending';
      default:
        return '';
    }
  }
  
  // Obtener texto del estado en español
  getStatusText(status: string): string {
    switch (status) {
      case 'programmed':
        return 'Programado';
      case 'cancelled':
        return 'Cancelado';
      case 'absent':
        return 'Ausente';
      case 'paid':
        return 'Pagado';
      case 'pending_payment':
        return 'Pendiente Pago';
      default:
        return status;
    }
  }
  
  eliminarTurno(id : number){
    this.appointmentService.cancelAppointment(id, "cancelled").subscribe(
      (response) => {
        this.snackBar.open('Turno eliminado exitosamente', 'Cerrar', { duration: 2500 });
        // Llama a connect para actualizar la fuente de datos con la nueva selección
        this.dataSource.connect();
      },
      (error) => {
        this.snackBar.open('Error al eliminar turno', 'Cerrar', { duration: 3500 });
      }
    );
  }

  async clientAbsense(id: number, clientName: string, time: string) {
    const Swal = (await import('sweetalert2')).default;
    
    const result = await Swal.fire({
      icon: 'warning',
      title: '⚠️ Marcar como Ausente',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-size: 16px; margin-bottom: 15px;">
            ¿Estás seguro de marcar como ausente a <strong>${clientName}</strong>?
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>🕐 Horario:</strong> ${time}</p>
          </div>
          <p style="font-size: 14px; color: #666;">
            Esta acción marcará al cliente como ausente y quedará registrado en su historial.
          </p>
        </div>
      `,
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar ausente',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#f57c00',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      this.appointmentService.cancelAppointment(id, "absent").subscribe(
        (response) => {
          this.snackBar.open('Turno marcado como ausente', 'Cerrar', { duration: 2500 });
          this.dataSource.connect();
          this.updateCounters();
        },
        (error) => {
          this.snackBar.open('Error al marcar ausencia', 'Cerrar', { duration: 3500 });
        }
      );
    }
  }
  
  async cancelAppointment(id: number, clientName: string, time: string) {
    const Swal = (await import('sweetalert2')).default;
    
    const result = await Swal.fire({
      icon: 'question',
      title: '❌ Cancelar Turno',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-size: 16px; margin-bottom: 15px;">
            ¿Estás seguro de cancelar el turno de <strong>${clientName}</strong>?
          </p>
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #721c24;"><strong>🕐 Horario:</strong> ${time}</p>
          </div>
          <p style="font-size: 14px; color: #666;">
            El turno será cancelado y el horario quedará disponible nuevamente.
          </p>
        </div>
      `,
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar turno',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      this.appointmentService.cancelAppointment(id, "cancelled").subscribe(
        (response) => {
          this.snackBar.open('Turno cancelado exitosamente', 'Cerrar', { duration: 2500 });
          this.dataSource.connect();
          this.updateCounters();
        },
        (error) => {
          this.snackBar.open('Error al cancelar turno', 'Cerrar', { duration: 3500 });
        }
      );
    }
  }

  async blockClient(clientId: string | null, email: string | null, phone_number: string | null, appointment_id: number, clientName: string) {
    if (!clientId && !email && !phone_number) {
      this.snackBar.open('Proporcione al menos un identificador: clientId, email o teléfono', 'Cerrar', { duration: 3500 });
      return;
    }

    const Swal = (await import('sweetalert2')).default;
    
    const result = await Swal.fire({
      icon: 'error',
      title: '🚫 Bloquear Cliente',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-size: 16px; margin-bottom: 15px;">
            ¿Estás seguro de bloquear a <strong>${clientName}</strong>?
          </p>
          <div style="background: #f8d7da; border: 1px solid #dc3545; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #721c24;"><strong>⚠️ ADVERTENCIA:</strong> El cliente no podrá crear nuevos turnos</p>
            <p style="margin: 5px 0; color: #721c24;"><strong>📧 Email:</strong> ${email || 'N/A'}</p>
            <p style="margin: 5px 0; color: #721c24;"><strong>📱 Teléfono:</strong> ${phone_number || 'N/A'}</p>
          </div>
          <p style="font-size: 14px; color: #666;">
            Esta acción bloqueará al cliente y cancelará su turno actual.
          </p>
        </div>
      `,
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: 'Sí, bloquear cliente',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      this.clientService.toggleClientBlockedStatus(clientId, email, phone_number).subscribe({
        next: response => {
          this.snackBar.open('Cliente bloqueado exitosamente', 'Cerrar', { duration: 2500 });
          this.cancelAppointment(appointment_id, clientName, '');
        },
        error: error => {
          this.snackBar.open('Error al bloquear cliente', 'Cerrar', { duration: 3500 });
        }
      });
    }
  }
  
}
