import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
})
export class ScheduleComponent {
 
  dias = [
    { key: 1, valor: 'Lunes' },
    { key: 2, valor: 'Martes' },
    { key: 3, valor: 'Miércoles' },
    { key: 4, valor: 'Jueves' },
    { key: 5, valor: 'Viernes' },
    { key: 6, valor: 'Sábado' },
    { key: 7, valor: 'Domingo' },
  ];

  horasAM = [
    '7:00 AM',
    '7:30 AM',
    '8:00 AM',
    '8:30 AM',
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
  ];

  horasPM = [
    '16:00 PM',
    '16:30 PM',
    '17:00 PM',
    '17:30 PM',
    '18:00 PM',
    '18:30 PM',
    '19:00 PM',
    '19:30 PM',
    '20:00 PM',
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
    console.log(dia);
    const selectedHora = (event.target as HTMLSelectElement).value;
    // Puedes hacer lo que necesites con la hora seleccionada
    //console.log('Hora seleccionada:', selectedHora);
    this.horarios[dia].morning_start = selectedHora;
  }
  onSelectMorningEnd(event: Event, dia: number) {
    console.log(dia);
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].morning_end = selectedHora;
  }
  onSelectAfternoonStart(event: Event, dia: number) {
    console.log(dia);
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].afternoon_start = selectedHora;
  }
  onSelectAfternoonEnd(event: Event, dia: number) {
    console.log(dia);
    const selectedHora = (event.target as HTMLSelectElement).value;
    this.horarios[dia].afternoon_end = selectedHora;
  }
  private inicializarHorarios(): void {
    this.dias.forEach((dia) => {
      this.horarios[dia.key] = {
        active_morning: false,
        active_afternoon: false,
        morning_start: '',
        morning_end: '12:00 PM',
        afternoon_start: '4:00 PM',
        afternoon_end: '8:00 PM',
        userId: localStorage.getItem('userId'),
      };
    });
  }

  guardarCambios(): void {
    // Obtén los horarios para enviar al servidor
    const horariosToSend = this.horarios;

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
