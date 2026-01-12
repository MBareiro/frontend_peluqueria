import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../services/auth.service';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent {
  dias = [
    { key: 1, valor: 'Domingo' },
    { key: 2, valor: 'Lunes' },
    { key: 3, valor: 'Martes' },
    { key: 4, valor: 'Miércoles' },
    { key: 5, valor: 'Jueves' },
    { key: 6, valor: 'Viernes' },
    { key: 7, valor: 'Sábado' },
  ];

  horasAM = [
    '7:00',
    '7:30',
    '8:00',
    '8:30',
    '9:00',
    '9:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
  ];

  horasPM = [
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
  ];

  horarios: { [key: number]: any } = {};

  constructor(
    private scheduleService: ScheduleService, 
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.horarios = {}; // Inicializamos horarios aquí

    const u = this.authService.currentUserValue;
    const user_id = u?.id ? String(u.id) : null;

    if (user_id) {
      const response: any = await this.scheduleService.getHorarioUsuario(user_id);
      if (!response.error) {
        if (response && Object.keys(response).length > 0) {
          this.horarios = response;
          this.cdr.markForCheck();
        } else {
          // Si no hay horario para el usuario, inicializa con valores predeterminados
          this.inicializarHorarios(); 
        }
      } else {
        this.snackBar.open('Error al obtener el horario del usuario', 'Cerrar', { duration: 3000 });
        // Inicializa con valores predeterminados si hay un error
        this.inicializarHorarios(); 
      }
    } else {
      this.snackBar.open('No se encontró un ID de usuario.', 'Cerrar', { duration: 3000 });
      // Inicializa con valores predeterminados si no hay un ID de usuario
      this.inicializarHorarios();
    }
  }

  toggleCheckbox(diaKey: number, property: string) {
    if (this.horarios[diaKey]) {
      if (this.horarios[diaKey][property] !== undefined) {
        this.horarios[diaKey][property] = !this.horarios[diaKey][property];
        this.cdr.markForCheck();
      }
    }
  }

  onSelectMorningStart(value: string, dia: number) {
    if (!this.horarios[dia]) this.horarios[dia] = {};
    this.horarios[dia].morning_start = value;
  }

  onSelectMorningEnd(value: string, dia: number) {
    if (!this.horarios[dia]) this.horarios[dia] = {};
    this.horarios[dia].morning_end = value;
  }

  onSelectAfternoonStart(value: string, dia: number) {
    if (!this.horarios[dia]) this.horarios[dia] = {};
    this.horarios[dia].afternoon_start = value;
  }

  onSelectAfternoonEnd(value: string, dia: number) {
    if (!this.horarios[dia]) this.horarios[dia] = {};
    this.horarios[dia].afternoon_end = value;
  }

  // Convert time strings to numbers for comparison
  timeToNumber(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private inicializarHorarios(): void {
    const u = this.authService.currentUserValue;
    const uid = u?.id ? String(u.id) : null;
    this.dias.forEach((dia) => {
      this.horarios[dia.key] = {
        active_morning: false,
        active_afternoon: false,
        morning_start: '7:00',
        morning_end: '12:00',
        afternoon_start: '16:00',
        afternoon_end: '20:00',
        user_id: uid,
      };
    });
  }

  async guardarCambios(): Promise<void> {
    // Obtén los horarios para enviar al servidor
  const horariosToSend = this.horarios;
  const u = this.authService.currentUserValue;
  const user_id = u?.id ? String(u.id) : null;
  if (user_id) {
      // Llama al método del servicio para guardar los horarios
      const response: any = await this.scheduleService.guardarHorarios(
        horariosToSend,
        user_id
      );
      if (!response.error) {
        this.snackBar.open('Horarios guardados exitosamente', 'Cerrar', { duration: 2500 });
        // Puedes realizar acciones adicionales aquí después de guardar los horarios
        const { default: Swal } = await import('sweetalert2');
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Exito!',
          background: '#191c24',
          timer: 1500,
        });
      } else {
        this.snackBar.open('Error al guardar los horarios', 'Cerrar', { duration: 3000 });
        // Maneja el error de manera adecuada
          } 
    }
  }

  // TrackBy functions para optimizar *ngFor
  trackByDiaKey = (_index: number, dia: { key: number; valor: string }): number => dia.key;
  trackByHora = (_index: number, hora: string): string => hora;
}
