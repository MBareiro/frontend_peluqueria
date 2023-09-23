import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AppointmentService } from '../../services/appointment.service';
import { User } from '../../models/user.model';
import { ScheduleService } from '../../services/schedule.service';
import { Horario } from '../../models/horario.model';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-create-turn',
  templateUrl: './create-turn.component.html',
  styleUrls: ['./create-turn.component.css'],
})
export class CreateTurnComponent {
  users: User[] = [];
  horario: Horario[] = [];
  selectedDate: Date | null = null;
  selectedValue: string = '';
  inicio!: boolean;
  turnos: any[] = [];


  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
  ) {
    this.chargeUser();
    this.inicio = false;
  }

  private fb = inject(FormBuilder);
  addressForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.required],
    phoneNumber: [null, Validators.required],
    peluquero: [null, Validators.required],
    date: [null, Validators.required],
    selectedRadio: [null, Validators.required],
    schedule: ['free', Validators.required],
  });

  hasUnitNumber = false;

  onSubmit(): void {
    // Aquí puedes acceder a los valores del formulario
    const formData = this.addressForm.value;

    // Llama al servicio para enviar los datos al backend
    this.appointmentService.enviarFormulario(formData).subscribe(
      (response) => {
        console.log('Formulario enviado con éxito:', response);
        // Aquí puedes manejar la respuesta del backend si es necesario
      },
      (error) => {
        console.error('Error al enviar el formulario:', error);
        // Aquí puedes manejar cualquier error que ocurra durante la solicitud
      }
    );
  }

  chargeUser(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  chargeHorario(): void {
    const peluqueroID = this.addressForm.get('peluquero')?.value;
    const peluquero = peluqueroID ? peluqueroID : '';  // Convert to string if valid
    this.horarioService.getHorarioUsuario(peluquero).subscribe(
      (data: Horario[]) => {
        this.horario = data;
        console.log(this.horario)
        this.createRadioButtonsForDay(); // Update radio buttons when horario changes
      },
      (error) => {
        console.error('Error fetching horario:', error);
      }
    );
  }

  fechaSeleccionada(event: any): void {
    this.selectedDate = event.value;
    this.createRadioButtonsForDay(); // Update radio buttons when date changes
   
    this.chargeHorario()
  }

  onRadioChange(event: MatRadioChange) {
    console.log("onRadioChange")
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || '';  // If undefined, assign an empty string
  
    this.chargeHorario();
    this.turnos = this.createRadioButtonsForDay();
  }
 
  createRadioButtonsForDay(): any[] {
    let radioButtons = [];
    const periodo = this.addressForm.get('schedule')?.value;
  
    if (this.horario && this.selectedDate) {
      const selectedDay = this.selectedDate.getDay();
 
  
      if (this.horario[selectedDay]) {
        let morning_start: string | undefined;
        let morning_end: string | undefined;
  
        if (periodo === 'morning') {
          morning_start = this.horario[selectedDay]?.morning_start;
          morning_end = this.horario[selectedDay]?.morning_end;
        } else if (periodo === 'afternoon') {
          morning_start = this.horario[selectedDay]?.afternoon_start;
          morning_end = this.horario[selectedDay]?.afternoon_end;
        }
  
        if (morning_start && morning_end) {
          const horariosDelDia = this.generarHorasAM(morning_start, morning_end);
          radioButtons.push(
            ...horariosDelDia.map((hora, index) => ({
              id: `radio_${index}`,
              value: hora,
              label: hora,
            }))
          );
        }
      }
    }
    return radioButtons;
  }
  

  generarHorasAM(morning_start: string, morning_end: string): string[] {
    const startTimeParts = morning_start.split(':');
    const startHour = parseInt(startTimeParts[0], 10);

    const endTimeParts = morning_end.split(':');
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);

    const intervalInMinutes = 30;
    const horasAM: string[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalInMinutes) {
        if (hour === endHour && minute >= endMinute) {
          break;
        }
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
        const formattedMinute = minute === 0 ? '00' : `${minute}`;
        const amPm = hour < 12 ? 'AM' : 'PM';
        const formattedTime = `${formattedHour}:${formattedMinute} ${amPm}`;
        horasAM.push(formattedTime);
      }
    }
    return horasAM;
  }
  
}
