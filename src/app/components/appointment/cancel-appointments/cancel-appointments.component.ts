import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDateRangePicker, DateFilterFn } from '@angular/material/datepicker';
import { Horario } from 'src/app/models/horario.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { UserService } from 'src/app/services/user.service';
import { BloquedDayService } from 'src/app/services/bloqued-day.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-cancel-appointments',
  templateUrl: './cancel-appointments.component.html',
  styleUrls: ['./cancel-appointments.component.css'],
})
export class CancelAppointmentsComponent implements OnInit {
  @ViewChild('picker') picker!: MatDateRangePicker<any>;
  horario: Horario[] = [];
  blockedDatesArray: string[] = [];
  showCalendar: boolean = true;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  userId: number = 0;
  minDate!: Date;
  selected: Date | null | undefined;

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private blockedDayService: BloquedDayService,
    public horarioService: ScheduleService
  ) {}

  async ngOnInit() {
    this.userId = this.userService.verifyIdUser() || 0;
    await Promise.all([this.getHorarioPeluquero(), this.getDiasBloqueados()]);
    this.initializeDateFilter();
  }

  async getHorarioPeluquero() {
    try {
      const peluqueroID = this.userId;
      const peluquero = peluqueroID !== null ? peluqueroID.toString() : '';
      this.horario = await this.horarioService.getHorarioUsuario(peluquero);
      this.initializeDateFilter();
    } catch (error) {
      console.error('Error fetching horario:', error);
    }
  }

  async getDiasBloqueados() {
    try {
      const blockedDays = await this.blockedDayService.getBlockedDays(
        this.userId
      );
      if (blockedDays.length > 0) {
        this.blockedDatesArray = blockedDays.map((item: any) => {
          const blockedDate = new Date(item.blocked_date);
          return blockedDate.toISOString().split('T')[0];
        });
        const startDate = this.range?.get('start')?.value;
        const endDate = this.range?.get('end')?.value;
        if (startDate && endDate) {
          const missingDates = this.getDatesInRange(
            new Date(startDate),
            new Date(endDate)
          ).filter((date) => !this.blockedDatesArray.includes(date));
          this.blockedDatesArray = this.blockedDatesArray.concat(missingDates);
        }
      }
      this.initializeDateFilter();
    } catch (error) {
      if ((error as any).status === 404) {
        console.log('No se encontraron fechas bloqueadas para el peluquero');
      } else {
        console.error('Error al obtener fechas bloqueadas:', error);
      }
    }
  }
  
  initializeDateFilter() {
    this.esHabilitado = (date: Date | null) => {
      try {
        if (date === null || date === undefined || !this.horario) {
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
        const isDayBlocked =
          horarioEntry?.active_morning &&
          horarioEntry?.active_afternoon &&
          !isBlocked;

        return !!isDayBlocked;
      } catch (error) {
        console.error('Error fetching horario:', error);
        return false;
      }
    };
  }

  async deleteBlockedDay() {
    try {
      const deleteBlockedDay = await this.blockedDayService.deleteBlockedDay(
        this.userId
      );
      /* this.horario = [];
      this.getDiasBloqueados();
      this.esHabilitado = () => true; */
      this.initializeDateFilter();
    } catch (error) {
      console.log('failed to delete: ' + error);
    }
  }

  clearDateRange(): void {
    this.range.get('start')?.setValue(null);
    this.range.get('end')?.setValue(null);
  }

  async onSubmit() {
    const startDate = this.range?.get('start')?.value;
    const endDate = this.range?.get('end')?.value;

    if (startDate && endDate) {
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      // Generar todas las fechas dentro del rango
      const datesInRange = this.getDatesInRange(
        new Date(startDateString),
        new Date(endDateString)
      );

      // Verificar si alguna fecha del rango está en blockedDatesArray
      const isDateBlocked = datesInRange.some((date) =>
        this.blockedDatesArray.includes(date)
      );

      if (isDateBlocked) {
        console.log('Hay fechas bloqueadas dentro del rango seleccionado.');
        // Se borran los dias bloqueados
        await this.deleteBlockedDay();
      }

      // Se cancelan los turnos de los dias
      const cancelarTurnos =
        await this.appointmentService.cancelAppointmentsInDateRange(
          startDateString,
          endDateString,
          this.userId
        );

      // Bloquear dias seleccionados
      const diasBloqueados = await this.blockedDayService.createBlockedDayRange(
        startDateString,
        endDateString,
        this.userId
      );

      // Actualizar los días bloqueados
      await this.getDiasBloqueados();
      this.clearDateRange();
    } else {
      console.error('Selecciona un rango de fechas válido.');
    }
    this.showCalendar = false;
    this.showCalendar = true;
  }

  getDatesInRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  esHabilitado: DateFilterFn<any> = (date: Date | null) => {
    try {
      if (date === null || date === undefined || !this.horario) {
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

      const isDayBlocked =
        horarioEntry?.active_morning &&
        horarioEntry?.active_afternoon &&
        !isBlocked;

      return !!isDayBlocked;
    } catch (error) {
      console.error('esHabilitado:', error);
      return false;
    }
  };

  isBlocked(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.blockedDatesArray.includes(dateString);
  }
}
