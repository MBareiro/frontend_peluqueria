import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  
  features = [
    {
      icon: 'event',
      title: 'Gestión de Turnos',
      description: 'Sistema completo para que tus clientes reserven turnos online 24/7'
    },
    {
      icon: 'people',
      title: 'Gestión de Clientes',
      description: 'Mantén toda la información de tus clientes organizada y accesible'
    },
    {
      icon: 'schedule',
      title: 'Horarios Flexibles',
      description: 'Configura tus horarios de trabajo y disponibilidad fácilmente'
    },
    {
      icon: 'notifications',
      title: 'Notificaciones',
      description: 'Recordatorios automáticos por email para reducir ausencias'
    },
    {
      icon: 'assessment',
      title: 'Reportes',
      description: 'Analiza el rendimiento de tu negocio con estadísticas detalladas'
    },
    {
      icon: 'devices',
      title: 'Multi-dispositivo',
      description: 'Accede desde cualquier dispositivo: PC, tablet o celular'
    }
  ];

  benefits = [
    {
      number: '1',
      title: 'Ahorra Tiempo',
      description: 'Elimina llamadas telefónicas y mensajes. Tus clientes reservan cuando quieran.'
    },
    {
      number: '2',
      title: 'Reduce Ausencias',
      description: 'Recordatorios automáticos que disminuyen las faltas hasta en un 70%.'
    },
    {
      number: '3',
      title: 'Aumenta Ingresos',
      description: 'Más turnos ocupados significa más ganancias para tu negocio.'
    }
  ];

  howItWorks = [
    {
      step: '1',
      title: 'Configura',
      description: 'Agrega tus servicios, horarios y empleados',
      icon: 'settings'
    },
    {
      step: '2',
      title: 'Comparte',
      description: 'Comparte tu link personalizado con tus clientes',
      icon: 'share'
    },
    {
      step: '3',
      title: 'Gestiona',
      description: 'Administra todos tus turnos desde un solo lugar',
      icon: 'dashboard'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      business_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['']
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.contactService.submitContact(this.contactForm.value).subscribe({
      next: (response) => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        this.contactForm.reset();
        
        this.snackBar.open(
          '✅ ¡Solicitud enviada! Te contactaremos pronto.',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );

        // Resetear el estado después de 3 segundos
        setTimeout(() => {
          this.submitSuccess = false;
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error enviando formulario:', error);
        
        // Mensaje específico si el backend no está disponible
        const message = error.status === 0 
          ? '⚠️ No se pudo conectar con el servidor. Por favor verifica tu conexión o intenta más tarde.'
          : '❌ Error al enviar. Por favor intenta nuevamente.';
        
        this.snackBar.open(
          message,
          'Cerrar',
          {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    
    if (field?.hasError('minlength')) {
      return 'Mínimo 2 caracteres';
    }
    
    return '';
  }

  scrollToContact() {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
