import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'src/app/services/appointment.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cancel-appointment',
  templateUrl: './cancel-appointment.component.html',
  styleUrls: ['./cancel-appointment.component.css']
})
export class CancelAppointmentComponent implements OnInit {
  appointmentId: number;

  constructor(private route: ActivatedRoute, private router: Router, private appointmentService: AppointmentService) {
    this.appointmentId = 0
   }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appointmentId = +params['id']; // Obtiene el ID del turno desde los parámetros de la URL
    });
  }

  cancelAppointment() {
    // Llama a un servicio para cancelar el turno
    this.appointmentService.cancelAppointment(this.appointmentId).subscribe(
      (data) => {
        console.log(data);
        this.router.navigate(['/appointment-cancelled']);
      },
      (error) => {
        if (error.status === 400) {                  
          const statusCode = error.status;                  
          const errorMessage = error.error.message;   
          Swal.fire({
            icon: 'error',
            title: 'Error',
            color: 'white',
            background: '#191c24',
            text: errorMessage,            
            showConfirmButton: true
          });                
        } else {
          console.error('Error cancelling appointment:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            color: 'white',
            background: '#191c24',
            text: 'Hubo un error al cancelar el turno. Por favor, inténtalo de nuevo más tarde.',            
            showConfirmButton: true
          }); 
        }        
      }
    );
  }
}
