import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AppointmentService } from 'src/app/services/appointment.service';
import { UserService } from 'src/app/services/user.service';
import { BloquedDayService } from 'src/app/services/bloqued-day.service';

@Component({
  selector: 'app-cancel-appointments',
  templateUrl: './cancel-appointments.component.html',
  styleUrls: ['./cancel-appointments.component.css'],
})
export class CancelAppointmentsComponent {
  
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  userId: number = 0; // Declaración de userId con un valor por defecto
  minDate!: Date;

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private blockedDayService: BloquedDayService
  ) {}

  ngOnInit(): void {
    
    const currentDay = new Date();  // Obtiene la fecha actual
    this.minDate = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()+1);
    // Resto del código...
    const userId = this.userService.verifyIdUser();
    if (userId !== null) {
      this.userId = userId;
    }    
    //this.cambiarValores()
    this.blockedDayService.getBlockedDays(this.userId)
      .subscribe(
        (response) => {
          //console.log(response);
          if (response.length > 0) {
            // Obtén la primera y última fecha de los días bloqueados
            const startDate = response[0].blocked_date;
            const endDate = response[response.length - 1].blocked_date;
            console.log("entro");
            
            // Actualiza el FormGroup con las fechas
            //this.range.patchValue({ start: startDate, end: endDate });
            this.range.get('start')?.setValue(new Date(startDate));            
            this.range.get('end')?.setValue(new Date(endDate));
          }
        },
        (error) => {
          console.error('Error al obtener días bloqueados:', error);
        }
      );
  
  }
  cambiarValores() {
    // Cambiar el valor del campo 'start'
    this.range.get('start')?.setValue(new Date('2023-11-15'));

    // Cambiar el valor del campo 'end'
    this.range.get('end')?.setValue(new Date('2023-11-30'));
    /* this.blockedDayService
      .getBlockedDays(this.userId)
      .subscribe(
        (blockingResponse) => {
          // Manejar la respuesta de bloqueo (puedes mostrar un mensaje de confirmación)
        },
        (blockingError) => {
          console.error('Error al bloquear los días:', blockingError);
        }
      ); */
  }    
 
  deleteBlockedDay(): void {
    
    this.blockedDayService
        .deleteBlockedDay(this.userId)
        .subscribe(
          (response) => {
            console.log(response)
            // Manejar la respuesta del servicio (por ejemplo, mostrar un mensaje de confirmación).   
            this.clearDateRange()  
               
          },
          (error) => {
            console.error('Error al cancelar turnos:', error);
          }
        );
  }
  clearDateRange() {
    // Para restablecer los valores a null
    this.range.get('start')?.setValue(null);
    this.range.get('end')?.setValue(null);
  }

  onSubmit(): void {
    const startDate = this.range?.get('start')?.value;
    const endDate = this.range?.get('end')?.value;  
    if (startDate && endDate) {
      // Convierte startDate y endDate a cadenas en formato ISO 8601
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();  
      // Llama al servicio para cancelar los turnos en el rango de fechas
      this.appointmentService
        .cancelAppointmentsInDateRange(startDateString, endDateString, this.userId)
        .subscribe(
          (response) => {
            // Manejar la respuesta del servicio (por ejemplo, mostrar un mensaje de confirmación).  
            // Después de cancelar los turnos, bloquea los días en el rango de fechas
            this.deleteBlockedDay()
            this.blockedDayService
              .createBlockedDayRange(startDateString, endDateString, this.userId)
              .subscribe(
                (blockingResponse) => {
                  // Manejar la respuesta de bloqueo (puedes mostrar un mensaje de confirmación)
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
  }
}
