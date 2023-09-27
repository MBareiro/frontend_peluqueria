import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
})
export class ScheduleComponent {
  dias = [
    { key: 2, valor: 'Lunes' },
    { key: 3, valor: 'Martes' },
    { key: 4, valor: 'Miércoles' },
    { key: 5, valor: 'Jueves' },
    { key: 6, valor: 'Viernes' },
    { key: 7, valor: 'Sábado' },
    { key: 1, valor: 'Domingo' },
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

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.horarios = {}; // Inicializamos horarios aquí

    // Obtener el ID de usuario de alguna manera (puedes usar localStorage, etc.)
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.scheduleService.getHorarioUsuario(userId).subscribe(
        (response) => {
          if (response && Object.keys(response).length > 0) {
            this.horarios = response;
          } else {
            // Si no hay horario para el usuario, inicializa con valores predeterminados
            this.inicializarHorarios();
          }
        },
        (error) => {
          console.error('Error al obtener el horario del usuario', error);
          // Inicializa con valores predeterminados si hay un error
          this.inicializarHorarios();
        }
      );
    } else {
      console.error('No se encontró un ID de usuario.');
      // Inicializa con valores predeterminados si no hay un ID de usuario
      this.inicializarHorarios();
    }
  }
  toggleCheckbox(diaKey: number, property: string) {
    if (this.horarios[diaKey]) {
      if (this.horarios[diaKey][property] !== undefined) {
        this.horarios[diaKey][property] = !this.horarios[diaKey][property];
      }
    }
  } 

  onSelectMorningStart(event: Event, dia: number) {
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].morning_start = selectedHora;
  }
  onSelectMorningEnd(event: Event, dia: number) {
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].morning_end = selectedHora;
  }
  onSelectAfternoonStart(event: Event, dia: number) {
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].afternoon_start = selectedHora;
  }
  onSelectAfternoonEnd(event: Event, dia: number) {
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].afternoon_end = selectedHora;
  }
  private inicializarHorarios(): void {
    this.dias.forEach((dia) => {
      this.horarios[dia.key] = {
        active_morning: false,
        active_afternoon: false,
        morning_start: '7:00 AM',
        morning_end: '12:00 PM',
        afternoon_start: '16:00 PM',
        afternoon_end: '20:00 PM',
        userId: localStorage.getItem('userId'),
      };
    });
  }

  guardarCambios(): void {
    // Obtén los horarios para enviar al servidor
    const horariosToSend = this.horarios;
    console.log(horariosToSend)

    // Llama al método del servicio para guardar los horarios
    this.scheduleService.guardarHorarios(horariosToSend).subscribe(
      (response) => {
        console.log('Horarios guardados exitosamente', response);
        // Puedes realizar acciones adicionales aquí después de guardar los horarios
      },
      (error) => {
        console.error('Error al guardar los horarios', error);
        // Maneja el error de manera adecuada
      }
    );
  }
}
