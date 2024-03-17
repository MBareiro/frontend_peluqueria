import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
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
import {
  DateFilterFn,
  MatDatepicker,
} from '@angular/material/datepicker';
@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css'],
})
export class CreateAppointmentComponent {
  @ViewChild('picker') datepicker!: MatDatepicker<any>;
  users: User[] = [];
  horario: Horario[] = [];
  selectedDate: Date | null = null;
  selectedValue: string = '';
  inicio!: boolean;
  turnos: any[] = [];
  error!: boolean;
  formularioEnviadoExitoso = false;
  minDate: Date;
  blockedDatesArray: string[] = [];
  userRole: string | null;
  loadingUsers = true;
  loadingCalendar = false;
  loadingSchedule = false;
  
  addressForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [
      Validators.required,
      Validators.pattern('^[a-zA-Z ]+$'),
    ]),
    lastName: new FormControl(null, Validators.required),
    email: new FormControl(
      null,
      this.isUser() ? [] : [Validators.required, Validators.email]
    ), // Condición para requerir email
    phoneNumber: new FormControl(
      null,
      this.isUser() ? [] : Validators.required
    ), // Condición para requerir teléfono
    peluquero: new FormControl(null, Validators.required),
    date: new FormControl({ value: '', disabled: true }, Validators.required),
    selectedRadio: new FormControl(null),
    schedule: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
  });
  
  ngOnInit() {
    this.chargeUser();
  }
  
  
  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
    public formValidator: FormValidators,
    public blockedDayService: BloquedDayService
  ) {
    this.userRole = localStorage.getItem('userRole');
    this.inicio = false;
    this.error = false;
    const currentDay = new Date(); // Obtiene la fecha actual
    this.minDate = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate() + 1
    );
    this.configureForm(); // Call method to configure the form
  }

  private fb = inject(FormBuilder); // Initialize addressForm property

  // Method to configure the form
  private configureForm(): void {
    this.addressForm = this.fb.group({
      firstName: [
        null,
        [Validators.required, Validators.pattern('^[a-zA-Z ]+$')],
      ],
      lastName: [null, Validators.required],
      email: new FormControl(
        null,
        this.isUser() ? [] : [Validators.required, Validators.email]
      ), // Condición para requerir email
      phoneNumber: new FormControl(
        null,
        this.isUser() ? [] : Validators.required
      ), // Condición para requerir teléfono
      peluquero: [null, Validators.required],
      date: [{ value: '', disabled: true }, Validators.required],
      selectedRadio: [{ value: '', disabled: true }],
      schedule: [{ value: '', disabled: true }, Validators.required],
    });
  }

  isUser(): boolean {    
    return this.userRole === 'admin' || this.userRole === 'peluquero'; // Reemplaza esto con tu lógica real
  }

  onSubmit(): void {
    const email = this.addressForm.get('email')?.value;
    const formData = this.addressForm.value;
    const peluqueroID = this.addressForm.get('peluquero')?.value;
    const date = this.addressForm.get('date')?.value;
    const selectedRadio = this.addressForm.get('selectedRadio')?.value;
    if (this.addressForm.invalid) {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      return;
    }
    if(!selectedRadio){
      Swal.fire({
        icon: 'info',
        color: 'white',
        title: 'Debe seleccionar un horario',
        text: '',
        background: '#191c24',
        timer: 6500,
        showConfirmButton: false,
      });
      return;
    }

    let turnoTomado = false; // Bandera para indicar si el turno está tomado

    this.appointmentService
      .checkIfAppointmentTaken(email, date, peluqueroID)
      .subscribe(
        (response) => {
          //turnoTomado = response; // Actualiza la bandera con la respuesta del servicio                   
          if (response.appointment_taken) {
            Swal.fire({
              icon: 'warning',
              color: 'white',
              title: 'Advertencia',
              text: 'Usted ya tiene un turno reservado para este día',
              background: '#191c24',
              timer: 6500,
              showConfirmButton: false,
            });
            return;
          } else {            
            // Continuar con la lógica de creación del turno
            if (email) {
              // El turno tiene un correo electrónico, por lo que se debe enviar la confirmación
              this.sendConfirmationAndCreateAppointment(email, formData);
            } else {
              // El turno no tiene un correo electrónico, simplemente crea el turno
              this.createAppointment(formData);
            }
          }
        },
        (error) => {
          // Lógica para manejar errores en la creación del turno
          console.error('Error al crear el turno:', error);
        }
      );
  }

  private sendConfirmationAndCreateAppointment(
    email: string,
    formData: any
  ): void {
    // Envía una solicitud para enviar el código de confirmación
    this.appointmentService.send_confirmation_code({ email: email }).subscribe(
      (response) => {
        //console.log('Código enviado con éxito:', response);
        Swal.fire({
          icon: 'info',
          title: 'Verificación de Código',
          input: 'text',
          color: 'white',
          text: 'Por favor, verifica tu correo electrónico. Hemos enviado un código de confirmación. Ingrésalo a continuación:',
          background: '#191c24',
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Cargar',

          showLoaderOnConfirm: true,
          preConfirm: (code) => {
            return this.appointmentService
              .confirmAppointment({
                email: email,
                code: code,
                formData: formData,
              })
              .toPromise()
              .then((response) => {
                if (
                  response &&
                  response[0].message === 'Código de confirmación incorrecto'
                ) {
                  // Accede al código de respuesta y al mensaje de error aquí
                  const statusCode = response[1];
                  const errorMessage = response[0].message;
                  Swal.showValidationMessage(
                    `Error (${statusCode}): ${errorMessage}`
                  );
                  return false;
                }
                return response;
              })
              .catch((error) => {
                // En caso de error, también puedes acceder al código de respuesta y al mensaje de error
                if (error.status === 400) {
                  const statusCode = error.status;
                  const errorMessage = error.error.message;
                  Swal.showValidationMessage(
                    `Error (${statusCode}): ${errorMessage}`
                  );
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

  private handleSuccessfulConfirmationAndCreate(
    email: string,
    formData: any
  ): void {
    // Lógica para manejar la confirmación exitosa, como enviar un correo de confirmación al cliente

    // A continuación, se crea el turno
    this.createAppointment(formData);
  }

  private createAppointment(formData: any): void {
    // Lógica para crear el turno
    this.appointmentService.createAppointment(formData).subscribe(
      (response) => {

        // Lógica para manejar la creación exitosa del turno, como mostrar un mensaje al usuario
        Swal.fire({
          icon: 'success',
          color: 'white',
          title: 'Turno Creado Exitosamente',
          background: '#191c24',
          timer: 6500,
          showConfirmButton: false,
        });
        this.addressForm.reset();
        this.turnos = [];
        
        // Supongamos que tienes un FormGroup llamado 'addressForm' con un FormControl 'selectedRadio'
        const scheduleControl = this.addressForm.get('schedule');
        const dateControl = this.addressForm.get('date');
        // Deshabilitar el control
        scheduleControl?.disable();
        dateControl?.disable();
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

    return this.appointmentService
      .getSpecificAppointments(periodo, date, peluquero)
      .pipe(
        tap((response) => console.log('Éxito:', response)), // Loguea la respuesta
        catchError((error) => {
          console.error('Error al obtener los horarios:', error);
          return []; // Retorna un array vacío en caso de error
        })
      );
  }

  filterActiveUsers(): void {
    this.users = this.users.filter((user) => user.active);
  }

  async chargeUser() {
    try {
      this.loadingUsers = true; // Muestra el indicador de carga
      const data = await this.userService.getUsers().toPromise();
      this.users = data!;
      this.filterActiveUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      this.loadingUsers = false; // Oculta el indicador de carga independientemente del resultado
    }
  }
  
  async chargeHorario(): Promise<void> {
    try {
     
      this.error = false;
      const peluqueroID = this.addressForm.get('peluquero')?.value;
      const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
      const data: Horario[] = await this.horarioService
        .getHorarioUsuario(peluquero)
        .toPromise();
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
    if(this.addressForm.get('selectedRadio')?.value){
      this.addressForm.get('selectedRadio')?.reset()
    }
    this.error = false;
  }

  onRadioChange(event: MatRadioChange) {    
    this.loadingSchedule = true;
    this.turnos = [];
    this.addressForm.get('selectedRadio')?.reset();
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || ''; // If undefined, assign an empty string
    this.chargeHorario();
    this.turnos = this.createRadioButtonsForDay();
    this.appointmentBD();   
      
  }

  createRadioButtonsForDay(): any[] {    
    this.error = false;
    let radioButtons: any[] = [];
    const periodo = this.addressForm.get('schedule')?.value;
    
    if (this.horario && this.selectedDate) {
      const selectedDay = this.selectedDate.getDay() + 1;
      
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
          this.appointmentBD().subscribe((occupiedHours) => {

            // Filtrar los horarios disponibles
            const horariosDisponibles = horariosDelDia.filter((hora) => {
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
            } else {
              this.error = false;
            }
            this.loadingSchedule = false; 
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
        const formattedMinute = minute === 0 ? '00' : `${minute}`;
        const formattedTime = `${formattedHour}:${formattedMinute}`;
        horas.push(formattedTime);
      }
    }
    return horas;
  }

  async peluquero() {
    try {
      this.loadingCalendar = true;
  
      const peluqueroID = this.addressForm.get('peluquero')?.value;
      const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
  
      // Mostrar mensaje de carga
      this.loadingCalendar = true;
  
      // Obtener horario del usuario de manera asíncrona
      const data: Horario[] = await this.horarioService.getHorarioUsuario(peluqueroID).toPromise();
      this.horario = data;
  
      // Obtener fechas bloqueadas de manera asíncrona
      const response = await this.blockedDayService.getBlockedDays(peluqueroID).toPromise();
      if (response.length > 0) {
        // Extract and format the dates
        this.blockedDatesArray = response.map((item: any) => {
          const blockedDate = new Date(item.blocked_date);
          return blockedDate.toISOString().split('T')[0];
        });
      }  
      // Ocultar mensaje de carga después de completar la carga
      this.loadingCalendar = false;
    } catch (error) {
      console.error('Error en el método peluquero:', error);
      // Manejar el error según tus necesidades
    } finally {
      this.loadingCalendar = false; // Oculta el indicador de carga independientemente del resultado
      
      this.addressForm.get('date')?.enable();
    }
  }
  

  // Modify the esHabilitado function
  esHabilitado: DateFilterFn<any> = (date: Date | null) => {
    if (date === null || date === undefined) {
      // Handle null or undefined case
      return false;
    }

    // Check if the date is in the blockedDatesArray
    const isBlocked = this.blockedDatesArray.includes(
      date.toISOString().split('T')[0]
    );

    // Get the day of the week (0 to 6, where 0 is Sunday and 6 is Saturday)
    const dayOfWeek = date.getDay();

    // Find the corresponding entry in the horario array
    let horarioEntry;
    switch (dayOfWeek) {
      case 1: // lunes
        horarioEntry = this.horario[2];
        break;
      case 2: // martes
        horarioEntry = this.horario[3];
        break;
      case 3: // miercoles
        horarioEntry = this.horario[4];
        break;
      case 4: // jueves
        horarioEntry = this.horario[5];
        break;
      case 5: // viernes
        horarioEntry = this.horario[6];
        break;
      case 6: // sabado
        horarioEntry = this.horario[7];
        break;
      case 0: // domingo
        horarioEntry = this.horario[1];
        break;
      default:
        break;
    }

    // Check if the horarioEntry is defined and both active_morning and active_afternoon are true
    const isDayBlocked =
      horarioEntry?.active_morning &&
      horarioEntry?.active_afternoon &&
      !isBlocked;

    return !!isDayBlocked; // Use double negation to ensure a boolean value
  };
}
