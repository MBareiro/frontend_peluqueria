import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { User } from '../../../models/user.model';
import { Horario } from '../../../models/horario.model';
import { UserService } from '../../../services/user.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ScheduleService } from '../../../services/schedule.service';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormValidators } from '../../shared/form-validators/form-validators';
import Swal from 'sweetalert2';
import { BloquedDayService } from 'src/app/services/bloqued-day.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
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
    email: new FormControl(null, this.isUser() ? [] : [Validators.required, Validators.email]), // Condición para requerir email
    phoneNumber: new FormControl(null, this.isUser() ? [] : Validators.required), // Condición para requerir teléfono
    peluquero: new FormControl(null, Validators.required),
    date: new FormControl({ value: '', disabled: true }, Validators.required),
    selectedRadio: new FormControl(null, Validators.required),
    schedule: new FormControl({ value: '', disabled: true }, Validators.required)
  });
  userRole: string | null;

  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
    public formValidator: FormValidators,
    public blockedDayService: BloquedDayService
  ) {
    this.userRole = localStorage.getItem('userRole');  
    console.log(this.userRole);
    
    this.chargeUser();
    this.inicio = false;
    this.error = false;
    const currentDay = new Date();  // Obtiene la fecha actual
    this.minDate = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()+1);
    this.configureForm();  // Call method to configure the form
  }

  private fb = inject(FormBuilder); // Initialize addressForm property

  // Method to configure the form
  private configureForm(): void {
    this.addressForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      lastName: [null, Validators.required],
      email: new FormControl(null, this.isUser() ? [] : [Validators.required, Validators.email]), // Condición para requerir email
      phoneNumber: new FormControl(null, this.isUser() ? [] : Validators.required), // Condición para requerir teléfono
      peluquero: [null, Validators.required],
      date: [{ value: '', disabled: true }, Validators.required],
      selectedRadio: [{ value: '', disabled: true }, Validators.required],
      schedule: [{ value: '', disabled: true }, Validators.required],
    });
  }
  isUser(): boolean {    
    return this.userRole === 'admin' || this.userRole === 'peluquero'; // Reemplaza esto con tu lógica real
  }
  onSubmit(): void {
    if (this.addressForm.invalid) {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      return;
    }  
    const email = this.addressForm.get('email')?.value;
    const formData = this.addressForm.value;  
    if (email) {
      // El turno tiene un correo electrónico, por lo que se debe enviar la confirmación
      this.sendConfirmationAndCreateAppointment(email, formData);
    } else {      
      // El turno no tiene un correo electrónico, simplemente crea el turno
      this.createAppointment(formData);
    }
  }
  
  private sendConfirmationAndCreateAppointment(email: string, formData: any): void {
    // Envía una solicitud para enviar el código de confirmación
    this.appointmentService.send_confirmation_code({ email: email }).subscribe(
      (response) => {
        console.log('Código enviado con éxito:', response);
  
        Swal.fire({
          icon: 'info',
          title: 'Verificación de Código',
          input: 'text',
          color: "white",
          text: "Por favor, verifica tu correo electrónico. Hemos enviado un código de confirmación. Ingrésalo a continuación:",
          background: '#191c24',
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Cargar',
          
          showLoaderOnConfirm: true,
          preConfirm: (code) => {
            return this.appointmentService.confirmAppointment({ email: email, code: code, formData: formData }).toPromise()
              .then((response) => {
                console.log(response[0].message);                
                if (response && response[0].message === 'Código de confirmación incorrecto') {
                  // Accede al código de respuesta y al mensaje de error aquí
                  const statusCode = response[1];
                  const errorMessage = response[0].message;
                  Swal.showValidationMessage(`Error (${statusCode}): ${errorMessage}`);
                  return false;
                }
                return response;
              })
              .catch((error) => {            
                // En caso de error, también puedes acceder al código de respuesta y al mensaje de error
                if (error.status === 400) {                  
                  const statusCode = error.status;                  
                  const errorMessage = error.error.message;                  
                  Swal.showValidationMessage(`Error (${statusCode}): ${errorMessage}`);
                } else {
                  Swal.showValidationMessage(`Error: ${error}`);
                }
                return false;
              });
          },
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {         
            this.handleSuccessfulConfirmationAndCreate(email, formData);
          }
        });     
      },
      (error) => {
        console.error('Error al enviar el código:', error);
      }
    );
  }
  
  private handleSuccessfulConfirmationAndCreate(email: string, formData: any): void {
    // Lógica para manejar la confirmación exitosa, como enviar un correo de confirmación al cliente
  
    // A continuación, se crea el turno
    this.createAppointment(formData);
  }
  
  private createAppointment(formData: any): void {    
    // Lógica para crear el turno
    this.appointmentService.createAppointment(formData).subscribe(
      (response) => {
        console.log(response);
        
        // Lógica para manejar la creación exitosa del turno, como mostrar un mensaje al usuario
        Swal.fire({
          icon: 'success',
          color: 'white',
          title: 'Turno Creado Exitosamente',
          text: '¡Gracias por elegir nuestros servicios!',
          background: '#191c24',
          timer: 6500,
          showConfirmButton: false,
        });
        this.addressForm.reset();
        this.turnos = [];
      },
      (error) => {
        // Lógica para manejar errores en la creación del turno
        console.error('Error al crear el turno:', error);
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
   
  filterActiveUsers(): void {
    this.users = this.users.filter(user => user.active);
  }

  async chargeUser() {
    try {
      const data = await this.userService.getUsers().toPromise();
      this.users = data!;
      this.filterActiveUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }  

  async chargeHorario(): Promise<void> {
    try {
      this.error = false;
      const peluqueroID = this.addressForm.get('peluquero')?.value;
      const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
      const data: Horario[] = await this.horarioService.getHorarioUsuario(peluquero).toPromise();
      this.horario = data;
      this.createRadioButtonsForDay(); // Update radio buttons when horario changes
    } catch (error) {
      console.error('Error fetching horario:', error);
    }
  }  

  fechaSeleccionada(event: any): void {    
    this.turnos = [];
    this.selectedDate = event.value;
    this.createRadioButtonsForDay(); // Update radio buttons when date changes
    this.chargeHorario();
    this.addressForm.get('schedule')?.clearValidators();
    this.addressForm.get('schedule')?.reset();
    this.addressForm.get('schedule')?.enable();
    this.addressForm.get('selectedRadio')?.enable();
    this.error = false;
  }

  onRadioChange(event: MatRadioChange) {    
    console.log("asdasdasd")
    this.turnos = [];
    this.addressForm.get('selectedRadio')?.reset();
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || ''; // If undefined, assign an empty string
    this.chargeHorario();
    this.turnos = this.createRadioButtonsForDay();
    this.appointmentBD()
    console.log(this.turnos);
    
  }

  createRadioButtonsForDay(): any[] {
    this.error = false;
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
            console.log("occupiedHours ",occupiedHours);
            
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
            if ((periodo === 'morning' && !this.horario[selectedDay]?.active_morning) || (periodo === 'afternoon' && !this.horario[selectedDay]?.active_afternoon)) {
              this.error = true;
            } else if ((periodo === 'morning' && this.horario[selectedDay]?.active_morning) || (periodo === 'afternoon' && this.horario[selectedDay]?.active_afternoon)) {
              this.error = false;
            } else {
              this.error = false;
            }
          });
        }
      }
    }
    console.log("radioButtons", radioButtons);
    
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
        const formattedMinute = minute === 0 ? '00' : `${minute}`; 
        const formattedTime = `${formattedHour}:${formattedMinute}`;
        horas.push(formattedTime);
      }
    }
    return horas;
  }

  peluquero() {
    this.addressForm.get('date')?.enable();

    const peluqueroID = this.addressForm.get('peluquero')?.value;
    console.log(peluqueroID);
    
    const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
    console.log(peluquero);
    
    this.blockedDayService.getBlockedDays(peluqueroID)
      .subscribe(
        (response) => {
          console.log(response);
          if (response.length > 0) {
            // Obtén la primera y última fecha de los días bloqueados
          }
        },
        (error) => {
          console.error('Error al obtener días bloqueados:', error);
        }
      );
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Inicializa una variable para el atributo aria-disabled
    let ariaDisabled = '';
  
    // Comprueba si la fecha actual es el día 15 del mes
    if (cellDate.getDate() === 15) {
      ariaDisabled = 'true'; // Establece aria-disabled en "true"
    }
  
    // Construye la cadena de clases y atributos
    const classes = ['mat-calendar-body-cell'];
    if (ariaDisabled) {
      classes.push('disabled-cell'); // Agrega una clase para el estilo de deshabilitado
    }
  
    // Retorna un objeto con las clases y atributos
    return {
      classes: classes.join(' '),
      attributes: {
        'aria-disabled': ariaDisabled // Agrega el atributo aria-disabled
      }
    };
  };
  
  isDateDisabled(date: Date): boolean {
    // Check if the date is the 15th of the month
    if (date.getDate() === 15) {
      // Return true if the date is the 15th of the month, false otherwise
      return true;
    } else {
      // Return false if the date is not the 15th of the month
      return false;
    }
  }
  

}
