import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessConfigService } from '../../services/business-config.service';
import { TenantService } from '../../core/services/tenant.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessConfig } from '../../models/business-config.model';

interface CarouselImage {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  businessConfig$: Observable<BusinessConfig | null>;
  carouselImages$: Observable<CarouselImage[]>;
  config: BusinessConfig | null = null;
  
  // Default images by business type
  private readonly defaultImages: Record<string, CarouselImage[]> = {
    barbershop: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Barbería profesional' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Cortes modernos' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Servicio de calidad' }
    ],
    beauty_salon: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Salón de belleza' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Tratamientos capilares' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Estilismo profesional' }
    ],
    nails: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Manicure profesional' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Diseños de uñas' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Cuidado de uñas' }
    ],
    spa: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Spa y relajación' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Tratamientos faciales' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Masajes terapéuticos' }
    ],
    massage: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Masajes profesionales' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Terapias corporales' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Relajación total' }
    ],
    tattoo: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Arte corporal' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Diseños personalizados' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Tatuajes profesionales' }
    ],
    other: [
      { url: 'assets/img/defaults/barbershop-1.jpg', alt: 'Bienvenido' },
      { url: 'assets/img/defaults/barbershop-2.jpg', alt: 'Nuestros servicios' },
      { url: 'assets/img/defaults/barbershop-3.jpg', alt: 'Reserva tu turno' }
    ]
  };

  constructor(
    private businessConfigService: BusinessConfigService,
    private tenantService: TenantService,
    private router: Router
  ) {
    this.businessConfig$ = this.businessConfigService.config$;
    
    // Build carousel images with custom URLs or defaults
    this.carouselImages$ = this.businessConfig$.pipe(
      map(config => this.getCarouselImages(config))
    );
  }

  ngOnInit(): void {
    // Verificar si hay un tenant seleccionado
    const tenant = this.tenantService.getTenant();
    const hostname = window.location.hostname;
    
    // Solo redirigir a landing si:
    // 1. Es producción (no localhost)
    // 2. Y el tenant es 'default' o 'www' (sin subdomain específico)
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname);
    const isRootDomain = tenant === 'default' || tenant === 'www';
    
    if (isProduction && isRootDomain) {
      // Producción sin subdomain: Redirigir a landing page genérica
      this.router.navigate(['/landing']);
      return;
    }

    // Tiene tenant válido: cargar configuración del negocio
    this.businessConfigService.loadConfig().catch(error => {
      console.error('Error cargando configuración del negocio:', error);
    });
    
    // Suscribirse a cambios en la configuración
    this.businessConfig$.subscribe(config => {
      this.config = config;
    });

    // Scripts
    // ...

    window.addEventListener('DOMContentLoaded', event => {
      // Navbar shrink function
      var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
          return;
        }
        if (window.scrollY === 0) {
          navbarCollapsible.classList.remove('navbar-shrink')
        } else {
          navbarCollapsible.classList.add('navbar-shrink')
        }
      };

      // Shrink the navbar 
      navbarShrink();

      // Shrink the navbar when page is scrolled
      document.addEventListener('scroll', navbarShrink);

      // Collapse responsive navbar when toggler is visible
      const navbarToggler = document.body.querySelector('.navbar-toggler');
      const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
      );/*
      responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
          if (window.getComputedStyle(navbarToggler).display !== 'none') {
            navbarToggler.click();
          }
        });
      });*/
    });
  }
  
  /**
   * Get carousel images - use custom URLs if configured, otherwise use defaults by business_type
   */
  private getCarouselImages(config: BusinessConfig | null): CarouselImage[] {
    if (!config) {
      return this.defaultImages['other'];
    }
    
    const images: CarouselImage[] = [];
    const businessName = config.business_name || 'Nuestro negocio';
    
    // Custom image 1
    if (config.carousel_image_1) {
      images.push({ url: config.carousel_image_1, alt: `${businessName} - Imagen 1` });
    }
    
    // Custom image 2
    if (config.carousel_image_2) {
      images.push({ url: config.carousel_image_2, alt: `${businessName} - Imagen 2` });
    }
    
    // Custom image 3
    if (config.carousel_image_3) {
      images.push({ url: config.carousel_image_3, alt: `${businessName} - Imagen 3` });
    }
    
    // If no custom images, use defaults by business_type
    if (images.length === 0) {
      const businessType = config.business_type || 'other';
      return this.defaultImages[businessType] || this.defaultImages['other'];
    }
    
    return images;
  }
  
  getHeroBackground(): string {
    if (this.config?.hero_background_image) {
      return `url(${this.config.hero_background_image})`;
    }
    // Default gradient if no image
    return 'linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%)';
  }
  
  getWhatsAppLink(): string {
    if (!this.config?.whatsapp_number) {
      return '#';
    }
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanNumber = this.config.whatsapp_number.replace(/[\s\-\(\)]/g, '');
    const message = encodeURIComponent(`Hola ${this.config.business_name || 'equipo'}! Me gustaría hacer una consulta.`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }
}
