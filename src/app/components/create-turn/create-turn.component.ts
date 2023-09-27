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
  error!: boolean;
  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
  ) {
    this.chargeUser();
    this.inicio = false;
    this.error = false;
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
    console.log('onSubmit')
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
      console.log(selectedDay)
 
  
      if (this.horario[selectedDay]) {
        let period_start: string | undefined;
        let period_end: string | undefined;
  
        if (periodo === 'morning' && this.horario[selectedDay]?.active_morning) {
          period_start = this.horario[selectedDay]?.morning_start;
          period_end = this.horario[selectedDay]?.morning_end;
        } else if (periodo === 'afternoon' && this.horario[selectedDay]?.active_afternoon) {
          period_start = this.horario[selectedDay]?.afternoon_start;
          period_end = this.horario[selectedDay]?.afternoon_end;
        }
  
        if (period_start && period_end) {
          const horariosDelDia = this.generarHorasAM(period_start, period_end);
          radioButtons.push(
            ...horariosDelDia.map((hora, index) => ({
              id: `radio_${index}`,
              value: hora,
              label: hora,
            }))
          );
        } 
        // si el periodo es elegido "morning" y el periodo morning es activo, no hay error
        if(periodo === "morning" && !this.horario[selectedDay]?.active_morning || periodo === "afternoon" && !this.horario[selectedDay]?.active_afternoon){
          this.error = true;
        } else if(periodo === "morning" && this.horario[selectedDay]?.active_morning || periodo === "afternoon" && this.horario[selectedDay]?.active_afternoon){
          this.error = false;
        }

      }
    }
    return radioButtons;
  }
  

  generarHorasAM(period_start: string, period_end: string): string[] {
    const startTimeParts = period_start.split(':');
    const startHour = parseInt(startTimeParts[0], 10);

    const endTimeParts = period_end.split(':');
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);
    const intervalInMinutes = 30;
    const horas: string[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalInMinutes) {
        if (hour === endHour && minute >= endMinute) {
          break;
        }
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
        const formattedMinute = minute === 0 ? '00' : `${minute}`;/* 
        const amPm = hour < 12 ? 'AM' : 'PM'; */
        const formattedTime = `${formattedHour}:${formattedMinute} `;
        horas.push(formattedTime);
      }
    }
    console.log("horas " , horas)
    return horas;
  }
  
}
