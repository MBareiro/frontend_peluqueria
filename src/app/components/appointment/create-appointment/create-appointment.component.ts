import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
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
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css'],
})
export class CreateAppointmentComponent {
  @ViewChild('picker') datepicker!: MatDatepicker<any>;
  @ViewChild('stepper') stepper!: MatStepper;
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
  personalDataForm!: FormGroup;
  styleDresserAndDateForm!: FormGroup;
  disponibilityForm!: FormGroup;

  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
    public appointmentService: AppointmentService,
    public formValidator: FormValidators,
    public blockedDayService: BloquedDayService,
    private router: Router
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
    this.personalDataForm = new FormGroup({
      first_name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]+$'),
      ]),
      last_name: new FormControl(null, Validators.required),
      email: new FormControl(
        null,
        this.isUser() ? [] : [Validators.required, Validators.email]
      ),
      phoneNumber: new FormControl(
        null,
        this.isUser() ? [] : Validators.required
      ),
    });

    this.styleDresserAndDateForm = new FormGroup({
      hairdresserId: new FormControl(null, Validators.required),
      date: new FormControl({ value: '', disabled: true }, Validators.required),
    });

    this.disponibilityForm = new FormGroup({
      schedule: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      time: new FormControl(null, Validators.required),
    });
  }

  isUser(): boolean {
    return this.userRole === 'admin' || this.userRole === 'peluquero'; // Reemplaza esto con tu lógica real
  }

  async onSubmit() {
    const firstName = this.personalDataForm.get('first_name')?.value;
    const lastName = this.personalDataForm.get('last_name')?.value;
    const email = this.personalDataForm.get('email')?.value;
    const phoneNumber = this.personalDataForm.get('phoneNumber')?.value;
    const hairdresserId =
      this.styleDresserAndDateForm.get('hairdresserId')?.value;
    const date = this.styleDresserAndDateForm.get('date')?.value;
    const time = this.disponibilityForm.get('time')?.value;
    const schedule = this.disponibilityForm.get('schedule')?.value; // Si tienes un campo adicional llamado `schedule`

    if (!time) {
      Swal.fire({
        icon: 'info',
        color: 'white',
        title: 'Debe seleccionar un horario',
        background: '#191c24',
        timer: 6500,
        showConfirmButton: false,
      });
      return;
    }

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phoneNumber: phoneNumber,
      hairdresserId: hairdresserId,
      date: date ? date.toISOString() : null, // Asegúrate de convertir la fecha a ISO si es necesario
      schedule: schedule,
      time: time,
    };

    try {
      if (email) {
        const response: any =
          await this.appointmentService.checkIfAppointmentTaken(
            email,
            date,
            hairdresserId
          );
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
        }
      }

      const isConfirmed = await this.confirmAppointmentDetails(formData);
      if (!isConfirmed) {
        return;
      }

      if (email && !this.isUser()) {
        await this.sendConfirmationAndCreateAppointment(email, formData);
      } else {
        await this.createAppointment(formData);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud de cita:', error);
      Swal.fire({
        icon: 'error',
        color: 'white',
        title: 'Error',
        text: 'Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente más tarde.',
        background: '#191c24',
        timer: 6500,
        showConfirmButton: false,
      });
    }
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
          console.log('preConfirm - Código ingresado: ', code);
          if (!code) {
            Swal.showValidationMessage(
              'Por favor, ingrese un código de confirmación.'
            );
            return false; // Si no hay código, no se debe continuar
          }

          try {
            const confirmResponse: any =
              await this.appointmentService.confirmAppointment({
                email,
                code,
                formData,
              });
            console.log(confirmResponse);

            if (confirmResponse.error) {
              const errorMessage =
                confirmResponse.error.status === 400
                  ? confirmResponse.error.error.message
                  : confirmResponse.error;

              Swal.showValidationMessage(`Error: ${errorMessage}`);
              return false;
            }

            return confirmResponse;
          } catch (error) {
            console.error('Error en preConfirm:', error);
            Swal.showValidationMessage(
              'Error al confirmar el código. Intente nuevamente.'
            );
            return false;
          }
        },
      });

      if (isConfirmed && code) {
        console.log('Código confirmado, creando el turno...');
        await this.createAppointment(formData); // Crear el turno si la confirmación es exitosa
      } else {
        console.log('Cancelación o error al ingresar el código');
      }
    } catch (error) {
      console.error('Error al enviar código de confirmación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar el código de confirmación',
        text: 'Ha ocurrido un error al intentar enviar el código de confirmación. Por favor, verifique que su correo electrónico sea válido.',
        background: '#191c24',
        color: 'white',
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
          timer: 2500,
          showConfirmButton: false,
        });
        this.turnos = [];
        // Supongamos que tienes un FormGroup llamado 'addressForm' con un FormControl 'time'
        const scheduleControl = this.disponibilityForm.get('schedule');
        const dateControl = this.styleDresserAndDateForm.get('date');
        // Deshabilitar el control
        scheduleControl?.disable();
        dateControl?.disable();
        // Redirigir a la misma página para forzar el recargado del componente
        if (this.isUser()) {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['dashboard/create-appointment']);
            });
        } else {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['/create-appointment']);
            });
        }
      },
      (error) => {
        // Lógica para manejar errores en la creación del turno
        console.error('Error al crear el turno:', error);
      }
    );
  }

  async appointmentBD() {
    const periodo = this.disponibilityForm.get('schedule')?.value;
    const date = this.styleDresserAndDateForm.get('date')?.value;
    const peluqueroID =
      this.styleDresserAndDateForm.get('hairdresserId')?.value;
    const peluquero = peluqueroID ? peluqueroID : '';
    console.log();

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
      const peluqueroID =
        this.styleDresserAndDateForm.get('hairdresserId')?.value;
      const peluquero = peluqueroID ? peluqueroID : ''; // Convert to string if valid
      console.log(peluquero);

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
    this.disponibilityForm.get('schedule')?.clearValidators();
    this.disponibilityForm.get('schedule')?.reset();
    this.disponibilityForm.get('schedule')?.enable();
    /* this.addressForm.get('time')?.enable(); */
    /*    if (this.addressForm.get('time')?.value) {
      this.addressForm.get('time')?.reset();
    } */
    this.error = false;
  }

  async onRadioChange(event: MatRadioChange) {
    this.loadingSchedule = true;
    this.turnos = [];
    this.disponibilityForm.get('time')?.reset();
    const selectedValue = event.value; // This is the selected value (morning or afternoon)
    this.selectedValue = selectedValue || ''; // If undefined, assign an empty string
    this.chargeHorario();
    this.turnos = await this.createRadioButtonsForDay();
  }

  async createRadioButtonsForDay() {
    this.error = false;
    let radioButtons: any[] = [];
    const periodo = this.disponibilityForm.get('schedule')?.value;

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

      const peluqueroID =
        this.styleDresserAndDateForm.get('hairdresserId')?.value;

      // Mostrar mensaje de carga
      this.loadingCalendar = true;

      // Obtener horario del usuario de manera asíncrona
      this.chargeHorario();

      // Obtener fechas bloqueadas de manera asíncrona
      this.getBlockedDates(peluqueroID);

      // Ocultar mensaje de carga después de completar la carga
      this.loadingCalendar = false;
    } catch (error) {
      console.error('Error en el método peluquero:', error);
      // Manejar el error según tus necesidades
    } finally {
      this.loadingCalendar = false; // Oculta el indicador de carga independientemente del resultado

      this.styleDresserAndDateForm.get('date')?.enable();
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
      return false;
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const withinRange = date >= new Date() && date <= maxDate;

    if (!withinRange) {
      return false;
    }

    const isBlocked = this.blockedDatesArray.includes(
      date.toISOString().split('T')[0]
    );
    const dayOfWeek = date.getDay();
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

    const isDayBlocked =
      horarioEntry?.active_morning &&
      horarioEntry?.active_afternoon &&
      !isBlocked;

    return !!isDayBlocked; // Use double negation to ensure a boolean value
  };

  /** Avanzar al siguiente paso si el formulario actual es válido */
  goToNextStep() {
    if (this.stepper.selected?.stepControl.valid) {
      this.stepper.next();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor completa los campos requeridos antes de avanzar.',
        background: '#191c24',
        color: 'white',
      });
    }
  }

  /** Retroceder al paso anterior */
  goToPreviousStep() {
    this.stepper.previous();
  }

  async confirmAppointmentDetails(formData: any): Promise<boolean> {
    // Formatear la fecha en dd-MM-yyyy
    const dateObj = new Date(formData.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const { isConfirmed } = await Swal.fire({
      title: 'Confirmar Turno',
      html: `
        <div>
          <p><strong>Nombre:</strong> ${formData.first_name} ${formData.last_name}</p>
          <p><strong>Email:</strong> ${formData.email || ""} </p>
          <p><strong>Teléfono:</strong> ${formData.phoneNumber}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Horario:</strong> ${formData.time}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      background: '#191c24',
      color: 'white',
    });

    return isConfirmed;
  }
}
