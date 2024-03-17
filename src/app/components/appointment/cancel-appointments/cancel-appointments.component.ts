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

  async ngOnInit(): Promise<void> {
    await this.initData();
    this.blockedDayService.getBlockedDays(this.userId).subscribe(
      (response) => {
        console.log(response);
        if (response.length > 0) {
          this.blockedDatesArray = response.map((item: any) => {
            const blockedDate = new Date(item.blocked_date);
            return blockedDate.toISOString().split('T')[0];
          });
          this.initializeDateFilter();
        }
      },
      (error) => {
        console.error('Error al obtener días bloqueados:', error);
      }
    );
  }

  async initData(): Promise<void> {
    const userId = this.userService.verifyIdUser();
    if (userId !== null) {
      this.userId = userId;
    }
    try {
      const peluqueroID = this.userId;
      const peluquero = peluqueroID !== null ? peluqueroID.toString() : '';
      this.horario = await this.horarioService
        .getHorarioUsuario(peluquero)
        .toPromise();
      this.initializeDateFilter();
    } catch (error) {
      console.error('Error fetching horario:', error);
    }

    this.blockedDayService.getBlockedDays(this.userId).subscribe(
      (response) => {
        //console.log(response);
        if (response.length > 0) {
          this.blockedDatesArray = response.map((item: any) => {
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
            console.log("missingDates ", missingDates);
            console.log("this.blockedDatesArray ", this.blockedDatesArray)
            
            this.blockedDatesArray =
              this.blockedDatesArray.concat(missingDates);
            console.log(this.blockedDatesArray);
          }
        }
      },
      (error) => {
        console.error('Error al obtener días bloqueados:', error);
      }
    );
  }

  getDatesInRange = (start: Date, end: Date) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  initializeDateFilter(): void {
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
 
  deleteBlockedDay(): void {
    this.blockedDayService.deleteBlockedDay(this.userId).subscribe(
      (response) => {
        console.log(response);
        this.clearDateRange();
        this.esHabilitado = () => true;
      },
      (error) => {
        console.error('Error al cancelar turnos:', error);
      }
    );
  }

  clearDateRange(): void {
    this.range.get('start')?.setValue(null);
    this.range.get('end')?.setValue(null);
  }

  onSubmit(): void {
    const startDate = this.range?.get('start')?.value;
    const endDate = this.range?.get('end')?.value;
    if (startDate && endDate) {
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();

      this.appointmentService
        .cancelAppointmentsInDateRange(
          startDateString,
          endDateString,
          this.userId
        )
        .subscribe(
          (response) => {
            this.deleteBlockedDay();
            this.blockedDayService
              .createBlockedDayRange(
                startDateString,
                endDateString,
                this.userId
              )
              .subscribe(
                (blockingResponse) => {
                  blockingResponse = [];
                  this.blockedDayService.getBlockedDays(this.userId).subscribe(
                    (response) => {
                      if (response.length > 0) {
                        this.blockedDatesArray = response.map((item: any) => {
                          const blockedDate = new Date(item.blocked_date);
                          return blockedDate.toISOString().split('T')[0];
                        });
                        const startDate = this.range?.get('start')?.value;
                        const endDate = this.range?.get('end')?.value;
                        console.log("startDateString ", startDateString);
                        console.log("endDateString ", endDateString);
                        
                        
                        if (startDateString && endDateString) {
                          const missingDates = this.getDatesInRange(
                            new Date(startDateString),
                            new Date(endDateString)
                          ).filter(
                            (date) => !this.blockedDatesArray.includes(date)
                          );
                          console.log("missingDates ", missingDates);
                          console.log("this.blockedDatesArray ", this.blockedDatesArray)
                          this.blockedDatesArray =
                            this.blockedDatesArray.concat(missingDates);
                        }
                        this.initializeDateFilter();
                      }
                    },
                    (error) => {
                      console.error('Error al obtener días bloqueados:', error);
                    }
                  );
                },
                (blockingError) => {
                  console.error('Error al bloquear los días:', blockingError);
                }
              );
          },
          (error) => {
            console.error('Error al cancelar turnos:', error);
          }
        );
    } else {
      console.error('Selecciona un rango de fechas válido.');
    }
    this.showCalendar = false;
    setTimeout(() => {
      this.showCalendar = true;
    });
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
      console.error('Error fetching horario:', error);
      return false;
    }
  };

  isBlocked(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.blockedDatesArray.includes(dateString);
  }

  chargeHorario(): Promise<Horario[] | undefined> {
    try {
      const peluqueroID = this.userId;
      const peluquero = peluqueroID !== null ? peluqueroID.toString() : '';
      return this.horarioService.getHorarioUsuario(peluquero).toPromise();
    } catch (error) {
      console.error('Error fetching horario:', error);
      return Promise.resolve(undefined);
    }
  }
}
