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
  user_id: number = 0;
  minDate!: Date;
  selected: Date | null | undefined;

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private blockedDayService: BloquedDayService,
    public horarioService: ScheduleService
  ) {}

  async ngOnInit() {
    this.user_id = this.userService.verifyIdUser() || 0;
    await Promise.all([this.getHorarioPeluquero(), this.getDiasBloqueados()]);
    this.initializeDateFilter();
  }

  async getHorarioPeluquero() {
    try {
      const hairdresserId = this.user_id;
      const peluquero = hairdresserId !== null ? hairdresserId.toString() : '';
      this.horario = await this.horarioService.getHorarioUsuario(peluquero);
      this.initializeDateFilter();
    } catch (error) {
      console.error('Error fetching horario:', error);
    }
  }

  async getDiasBloqueados() {
    try {
      const blockedDays = await this.blockedDayService.getBlockedDays(
        this.user_id
      );
      this.blockedDatesArray = blockedDays.map((item: any) => {
        const blockedDate = new Date(item.blocked_date);
        return blockedDate.toISOString().split('T')[0];
      });

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
         (horarioEntry?.active_morning ||
          horarioEntry?.active_afternoon) &&
          !isBlocked;
        return !!isDayBlocked;
      } catch (error) {
        console.error('Error in esHabilitado:', error);
        return false;
      }
    };
  }

  async deleteBlockedDays(dates: string[]) {
    try {
      await this.blockedDayService.deleteBlockedDays(this.user_id, dates);
      this.removeDatesFromArray(dates);
      this.initializeDateFilter();
    } catch (error) {
      console.error('Failed to delete:', error);
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
  
      // Fechas bloqueadas dentro del rango seleccionado
      const blockedDatesInRange = datesInRange.filter((date) =>
        this.blockedDatesArray.includes(date)
      );
      const unblockedDatesInRange = datesInRange.filter(
        (date) => !this.blockedDatesArray.includes(date)
      );
  
      if (
        blockedDatesInRange.length > 0 &&
        blockedDatesInRange.length < datesInRange.length
      ) {
        // Caso 1: Si hay alguna fecha bloqueada pero no todas
        // Bloquear todas las fechas en el rango que no están bloqueadas
        if (unblockedDatesInRange.length > 0) {
          await this.blockedDayService.createBlockedDays(
            unblockedDatesInRange,
            this.user_id
          );
          await this.appointmentService.cancelAppointments(
            unblockedDatesInRange,
            this.user_id
          );
        }
      } else if (blockedDatesInRange.length === datesInRange.length) {
        // Caso 2: Si todas las fechas en el rango están bloqueadas
        // Desbloquear todas las fechas en el rango
        await this.deleteBlockedDays(blockedDatesInRange);
      } else {
        // Caso 3: Si ninguna fecha está bloqueada
        // Bloquear todas las fechas en el rango
        await this.blockedDayService.createBlockedDays(
          datesInRange,
          this.user_id
        );
        await this.appointmentService.cancelAppointments(
          datesInRange,
          this.user_id
        );
      }
  
      // Actualizar los días bloqueados
      await this.getDiasBloqueados();
      this.clearDateRange();
    } else {
      console.error('Selecciona un rango de fechas válido.');
    }
    this.showCalendar = false;
    this.showCalendar = true;
  }
  

  removeDatesFromArray(dates: string[]) {
    this.blockedDatesArray = this.blockedDatesArray.filter(
      (date) => !dates.includes(date)
    );
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

  toggleCalendarVisibility() {
    this.showCalendar = false;
    setTimeout(() => {
      this.showCalendar = true;
    }, 0);
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
      console.error('Error in esHabilitado:', error);
      return false;
    }
  };
}
