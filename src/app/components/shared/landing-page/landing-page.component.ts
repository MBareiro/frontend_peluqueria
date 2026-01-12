import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  features = [
    {
      icon: '📅',
      title: 'Gestión de Turnos Online',
      description: 'Sistema inteligente de reservas 24/7. Tus clientes pueden agendar desde cualquier dispositivo.'
    },
    {
      icon: '👥',
      title: 'Gestión de Clientes',
      description: 'Base de datos completa con historial de servicios, preferencias y seguimiento personalizado.'
    },
    {
      icon: '💰',
      title: 'Control Financiero',
      description: 'Reportes detallados de ingresos, servicios más populares y análisis de rendimiento.'
    },
    {
      icon: '📱',
      title: 'Notificaciones Automáticas',
      description: 'Recordatorios por email para reducir inasistencias y mantener tu agenda llena.'
    },
    {
      icon: '🎨',
      title: 'Personalización Total',
      description: 'Logo, colores, servicios y horarios adaptados a tu negocio único.'
    },
    {
      icon: '🔒',
      title: 'Seguro y Confiable',
      description: 'Protección de datos, backups automáticos y acceso seguro desde cualquier lugar.'
    }
  ];

  businessTypes = [
    { icon: '💈', name: 'Barberías', description: 'Gestión completa para barberías modernas' },
    { icon: '💅', name: 'Salones de Belleza', description: 'Todo lo que necesitas para tu salón' },
    { icon: '💆', name: 'Spas y Masajes', description: 'Optimiza tus servicios de bienestar' },
    { icon: '🎨', name: 'Estudios de Tatuajes', description: 'Control total de tus sesiones' },
    { icon: '🏋️', name: 'Gimnasios', description: 'Administra clases y entrenadores' },
    { icon: '🏥', name: 'Consultorios', description: 'Agenda médica profesional' }
  ];

  testimonials = [
    {
      name: 'Carlos Martínez',
      business: 'Barbería Moderna',
      text: 'Desde que uso este sistema, mis inasistencias bajaron 70%. Mis clientes aman la facilidad de reservar online.',
      rating: 5
    },
    {
      name: 'Ana Rodríguez',
      business: 'Salón Venus',
      text: 'La mejor inversión para mi negocio. Ahorro horas de trabajo administrativo cada semana.',
      rating: 5
    },
    {
      name: 'Diego Fernández',
      business: 'Spa Relax',
      text: 'Profesional, fácil de usar y mi agenda siempre está organizada. Totalmente recomendado.',
      rating: 5
    }
  ];

  pricing = [
    {
      name: 'Básico',
      price: 'Gratis',
      period: 'siempre',
      features: [
        'Hasta 50 turnos/mes',
        '1 profesional',
        'Calendario básico',
        'Notificaciones por email'
      ],
      highlighted: false
    },
    {
      name: 'Profesional',
      price: '$29',
      period: '/mes',
      features: [
        'Turnos ilimitados',
        'Hasta 5 profesionales',
        'Gestión de clientes completa',
        'Reportes y estadísticas',
        'Personalización total',
        'Soporte prioritario'
      ],
      highlighted: true
    },
    {
      name: 'Empresarial',
      price: 'Personalizado',
      period: '',
      features: [
        'Todo del plan Profesional',
        'Profesionales ilimitados',
        'Múltiples sucursales',
        'API personalizada',
        'Capacitación incluida',
        'Soporte 24/7'
      ],
      highlighted: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Analytics o tracking code aquí
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToSignup(): void {
    // Redirigir a registro o super admin
    this.router.navigate(['/super-admin']);
  }

  goToLogin(): void {
    // En producción, podría ser un modal o página de login general
    this.router.navigate(['/login']);
  }

  getStars(rating: number): string[] {
    return Array(rating).fill('⭐');
  }
}
