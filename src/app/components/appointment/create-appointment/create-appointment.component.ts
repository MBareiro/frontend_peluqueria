import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { User } from '../../../models/user.model';
import { Horario } from '../../../models/horario.model';
import { UserService } from '../../../services/user.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ScheduleService } from '../../../services/schedule.service';
import { catchError, tap  } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormValidators } from '../../shared/form-validators/form-validators';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css'],
})
export class CreateAppointmentComponent {
  users: User[] = [];
  horario: Horario[] = [];
  selectedDate: Date | null = null;
  selectedValue: string = '';
  inicio!: boolean;
  turnos: any[] = [];
  error!: boolean;
  formularioEnviadoExitoso = false;
  minDate: Date;

  addressForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
    lastName: new FormControl(null, Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl(null, Validators.required),
    peluquero: new FormControl(null, Validators.required),
    date: new FormControl({ value: '', disabled: true }, Validators.required),
    selectedRadio: new FormControl(null, Validators.required),
    schedule: new FormControl({ value: '', disabled: true }, Validators.required)
  });

  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
    public formValidator: FormValidators
  ) {
    this.chargeUser();
    this.inicio = false;
    this.error = false;
    const currentDay = new Date();  // Obtiene la fecha actual
    this.minDate = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
    this.configureForm();  // Call method to configure the form
  }

  private fb = inject(FormBuilder); // Initialize addressForm property

  // Method to configure the form
  private configureForm(): void {
    this.addressForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      lastName: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [null, Validators.required],
      peluquero: [null, Validators.required],
      date: [{ value: '', disabled: true }, Validators.required],
      selectedRadio: [{ value: '', disabled: true }, Validators.required],
      schedule: [{ value: '', disabled: true }, Validators.required],
    });
  }
  isFirstNameInvalid() {
    const firstNameControl = this.addressForm.get('firstName');
    return firstNameControl?.hasError('required') && (firstNameControl.dirty || firstNameControl.touched);
  }  
  
  onSubmit(): void {
    console.log( this.isFirstNameInvalid())
    if (this.addressForm.invalid && !this.isFirstNameInvalid()) {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      return;
    }
    if(this.isFirstNameInvalid()){
      return
    }
    const formData = this.addressForm.value;
    this.appointmentService.enviarFormulario(formData).subscribe(
      (response) => {
        console.log('Formulario enviado con éxito:', response);
        this.clearValidatorsAndResetForm();
        Swal.fire({
          icon: 'success',
          color: 'white',
          text: 'Turno Creado!',
          background: '#191c24',
          timer: 1500,
        })
      },
      (error) => {
        console.error('Error al enviar el formulario:', error);
      }
    );
  }
  
  appointmentBD(): Observable<string[]> {
    const periodo = this.addressForm.get('schedule')?.value;
    const date = this.addressForm.get('date')?.value;
    const peluqueroID = this.addressForm.get('peluquero')?.value;
    const peluquero = peluqueroID ? peluqueroID : '';
  
    return this.appointmentService.getSpecificAppointments(periodo, date, peluquero)
      .pipe(
        tap(response => console.log('Éxito:', response)),  // Loguea la respuesta
        catchError(error => {
          console.error('Error al obtener los horarios:', error);
          return [];  // Retorna un array vacío en caso de error
        })
      );
  } 

  private clearValidatorsAndResetForm(): void {
    const controlsToClear = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'peluquero',
      'date',
      'selectedRadio',
      'schedule'
    ];

    controlsToClear.forEach((controlName) => {
      const control = this.addressForm.get(controlName);
      if (control) {
        control.clearValidators();
        control.reset();
      } else {
        console.error(`El control ${controlName} es nulo.`);
      }
    });
    
    this.addressForm.get('date')?.disable();
    this.addressForm.get('schedule')?.disable();
    this.turnos = [];
    this.addressForm.updateValueAndValidity();
  }
  filterActiveUsers(): void {
    this.users = this.users.filter(user => user.active);
  }
  chargeUser(): void {
    this.userService.getUsers().subscribe(
      (data) => {      
        this.users = data;
        this.filterActiveUsers()
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  chargeHorario(): void {
    const peluqueroID = this.addressForm.get('peluquero')?.value;
    const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
    this.horarioService.getHorarioUsuario(peluquero).subscribe(
      (data: Horario[]) => {
        this.horario = data;
        console.log(this.horario);
        this.createRadioButtonsForDay(); // Update radio buttons when horario changes
      },
      (error) => {
        console.error('Error fetching horario:', error);
      }
    );
  }

  fechaSeleccionada(event: any): void {
    this.error = false
    this.selectedDate = event.value;
    this.createRadioButtonsForDay(); // Update radio buttons when date changes
    this.chargeHorario();
    this.addressForm.get('schedule')?.clearValidators();
    this.addressForm.get('schedule')?.reset();
    this.turnos = [];
    this.addressForm.get('schedule')?.enable();
    this.addressForm.get('selectedRadio')?.enable();
  }

  onRadioChange(event: MatRadioChange) {
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || ''; // If undefined, assign an empty string
    this.chargeHorario();
    this.turnos = this.createRadioButtonsForDay();
    if(this.turnos.length === 0){
      this.error = true;
    }
    this.appointmentBD()
  }

  createRadioButtonsForDay(): any[] {
    let radioButtons: any[] = [];
    const periodo = this.addressForm.get('schedule')?.value;
  
    if (this.horario && this.selectedDate) {
      const selectedDay = this.selectedDate.getDay();
  
      if (this.horario[selectedDay]) {
        let period_start: string | undefined;
        let period_end: string | undefined;
  
        if (
          periodo === 'morning' &&
          this.horario[selectedDay]?.active_morning
        ) {
          period_start = this.horario[selectedDay]?.morning_start;
          period_end = this.horario[selectedDay]?.morning_end;
        } else if (
          periodo === 'afternoon' &&
          this.horario[selectedDay]?.active_afternoon
        ) {
          period_start = this.horario[selectedDay]?.afternoon_start;
          period_end = this.horario[selectedDay]?.afternoon_end;
        } 
  
        if (period_start && period_end) {
          const horariosDelDia = this.generarHorasAM(period_start, period_end);
          
          // Obtener los horarios ocupados del servidor
          this.appointmentBD().subscribe(occupiedHours => {
            // Filtrar los horarios disponibles
            const horariosDisponibles = horariosDelDia.filter(hora => {
              return !occupiedHours.includes(hora);
            });
  
            radioButtons.push(
              ...horariosDisponibles.map((hora, index) => ({
                id: `radio_${index}`,
                value: hora,
                label: hora,
              }))
            );
  
            // si el periodo es elegido "morning" y el periodo morning es activo, no hay error
            if (
              (periodo === 'morning' &&
                !this.horario[selectedDay]?.active_morning) ||
              (periodo === 'afternoon' &&
                !this.horario[selectedDay]?.active_afternoon)
            ) {
              this.error = true;
            } else if (
              (periodo === 'morning' &&
                this.horario[selectedDay]?.active_morning) ||
              (periodo === 'afternoon' &&
                this.horario[selectedDay]?.active_afternoon)
            ) {
              this.error = false;
            }
          });
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
        const formattedMinute = minute === 0 ? '00' : `${minute}`; /* 
        const amPm = hour < 12 ? 'AM' : 'PM'; */
        const formattedTime = `${formattedHour}:${formattedMinute} `;
        horas.push(formattedTime);
      }
    }
    console.log('horas ', horas);
    return horas;
  }

  peluquero() {
    this.addressForm.get('date')?.enable();
  }

 

}
