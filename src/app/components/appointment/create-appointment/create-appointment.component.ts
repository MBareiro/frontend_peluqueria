import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
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
import { DateFilterFn, MatDatepicker } from '@angular/material/datepicker';

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
  addressForm!: FormGroup;

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
    this.createAddressForm();
  }

  ngOnInit() {
    this.chargeUser().then(() => {
      this.checkUserRole();
    });
  }

  checkUserRole() {
    if (this.isUser()) {
    }
  }
  createAddressForm() {
    this.addressForm = new FormGroup({
      firstName: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]+$'),
      ]),
      lastName: new FormControl(null, Validators.required),
      email: new FormControl(
        null,
        this.isUser() ? [] : [Validators.required, Validators.email]
      ),
      phoneNumber: new FormControl(
        null,
        this.isUser() ? [] : Validators.required
      ),
      peluquero: new FormControl(null, Validators.required),
      date: new FormControl({ value: '', disabled: true }, Validators.required),
      time: new FormControl(null),
      schedule: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
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
    const time = this.addressForm.get('time')?.value;
    if (this.addressForm.invalid) {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      return;
    }
    if (!time) {
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

    this.appointmentService
      .checkIfAppointmentTaken(email, date, peluqueroID)
      .subscribe(
        (response) => {
          console.log(response);

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
  private async sendConfirmationAndCreateAppointment(
    email: string,
    formData: any
  ) {
    try {
      const response: any =
        await this.appointmentService.send_confirmation_code({
          email: email,
        });

      const { value: code, isConfirmed } = await Swal.fire({
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
        allowOutsideClick: false,
        preConfirm: async (code) => {
          const response: any =
            await this.appointmentService.confirmAppointment({
              email,
              code,
              formData,
            });

          if (response.error) {
            const errorMessage =
              response.error.status === 400
                ? response.error.error.message
                : response.error;

            Swal.showValidationMessage(`Error: ${errorMessage}`);
            return false;
          }
          return response;
        },
      });

      if (isConfirmed) {
        this.createAppointment(formData);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar el código de confirmación',
        text: 'Ha ocurrido un error al intentar enviar el código de confirmación. Por favor, verifique que su correo electrónico sea válido.',
        background: '#191c24',
        color: 'white'
      });
    }
  }

  private createAppointment(formData: any): void {
    // Lógica para crear el turno
    this.appointmentService.createAppointment(formData).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          color: 'white',
          title: 'Turno Creado Exitosamente',
          background: '#191c24',
          timer: 6500,
          showConfirmButton: false,
        });
        this.turnos = [];
        this.addressForm.reset();
        this.addressForm.disable();
        this.addressForm.enable();
        // Supongamos que tienes un FormGroup llamado 'addressForm' con un FormControl 'time'
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

  async appointmentBD() {
    const periodo = this.addressForm.get('schedule')?.value;
    const date = this.addressForm.get('date')?.value;
    const peluqueroID = this.addressForm.get('peluquero')?.value;
    const peluquero = peluqueroID ? peluqueroID : '';
    return await this.appointmentService.getSpecificAppointments(
      periodo,
      date.toISOString(),
      peluquero
    );
  }

  filterActiveUsers(): void {
    this.users = this.users.filter((user) => user.active);
  }

  async chargeUser() {
    try {
      this.loadingUsers = true; // Muestra el indicador de carga
      const data = await this.userService.getUsers();
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
      const data: Horario[] = await this.horarioService.getHorarioUsuario(
        peluquero
      );
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
    this.addressForm.get('time')?.enable();
    if (this.addressForm.get('time')?.value) {
      this.addressForm.get('time')?.reset();
    }
    this.error = false;
  }

  async onRadioChange(event: MatRadioChange) {
    this.loadingSchedule = true;
    this.turnos = [];
    this.addressForm.get('time')?.reset();
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || ''; // If undefined, assign an empty string
    this.chargeHorario();
    this.turnos = await this.createRadioButtonsForDay();
  }

  async createRadioButtonsForDay() {
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
          const occupiedHours = await this.appointmentBD();

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

      // Mostrar mensaje de carga
      this.loadingCalendar = true;

      // Obtener horario del usuario de manera asíncrona
      this.chargeHorario()

      // Obtener fechas bloqueadas de manera asíncrona
      this.getBlockedDates(peluqueroID)

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

  async getBlockedDates(peluqueroID: number) {
    try {      
      // Obtener fechas bloqueadas de manera asíncrona
      const response = await this.blockedDayService.getBlockedDays(peluqueroID);
      if (response.length > 0) {
        // Extract and format the dates
        this.blockedDatesArray = response.map((item: any) => {
          const blockedDate = new Date(item.blocked_date);
          return blockedDate.toISOString().split('T')[0];
        });
      }
    } catch (error) {
      if ((error as any).status === 404) {
        console.log('No se encontraron fechas bloqueadas para el peluquero');
      } else {
        console.error('Error al obtener fechas bloqueadas:', error);
      }
    }
  }
  
  

  esHabilitado: DateFilterFn<any> = (date: Date | null) => {
    if (date === null || date === undefined) {
      // Handle null or undefined case
      return false;
    }

    // Calculate the maximum date allowed (30 days in the future from the current date)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    // Check if the date is within the allowed range (from current date to 30 days in the future)
    const withinRange = date >= new Date() && date <= maxDate;

    if (!withinRange) {
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
      case 3: // miércoles
        horarioEntry = this.horario[4];
        break;
      case 4: // jueves
        horarioEntry = this.horario[5];
        break;
      case 5: // viernes
        horarioEntry = this.horario[6];
        break;
      case 6: // sábado
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
