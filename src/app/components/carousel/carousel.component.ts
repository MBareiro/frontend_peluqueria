import { Component, OnInit } from '@angular/core';
import { BusinessConfigService } from '../../services/business-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessConfig } from '../../models/business-config.model';

interface CarouselImage {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  carouselImages$!: Observable<CarouselImage[]>;
  carouselConfig$!: Observable<{ autoPlay: boolean; interval: number }>;
  
  // Default images by business type
  private readonly defaultImages: Record<string, CarouselImage[]> = {
    barbershop: [
      { url: 'assets/img/carousel/barbershop-1.svg', alt: 'Barbería profesional' },
      { url: 'assets/img/carousel/barbershop-2.svg', alt: 'Cortes modernos' },
      { url: 'assets/img/carousel/barbershop-3.svg', alt: 'Servicio de calidad' }
    ],
    beauty_salon: [
      { url: 'assets/img/carousel/salon-1.svg', alt: 'Salón de belleza' },
      { url: 'assets/img/carousel/salon-2.svg', alt: 'Tratamientos capilares' },
      { url: 'assets/img/carousel/salon-3.svg', alt: 'Estilismo profesional' }
    ],
    nails: [
      { url: 'assets/img/carousel/nails-1.svg', alt: 'Manicure profesional' },
      { url: 'assets/img/carousel/nails-2.svg', alt: 'Diseños de uñas' },
      { url: 'assets/img/carousel/nails-3.svg', alt: 'Cuidado de uñas' }
    ],
    spa: [
      { url: 'assets/img/carousel/spa-1.svg', alt: 'Spa y relajación' },
      { url: 'assets/img/carousel/spa-2.svg', alt: 'Tratamientos faciales' },
      { url: 'assets/img/carousel/spa-3.svg', alt: 'Masajes terapéuticos' }
    ],
    massage: [
      { url: 'assets/img/carousel/massage-1.svg', alt: 'Masajes profesionales' },
      { url: 'assets/img/carousel/massage-2.svg', alt: 'Terapias corporales' },
      { url: 'assets/img/carousel/massage-3.svg', alt: 'Relajación total' }
    ],
    tattoo: [
      { url: 'assets/img/carousel/tattoo-1.svg', alt: 'Arte corporal' },
      { url: 'assets/img/carousel/tattoo-2.svg', alt: 'Diseños personalizados' },
      { url: 'assets/img/carousel/tattoo-3.svg', alt: 'Tatuajes profesionales' }
    ],
    other: [
      { url: 'assets/img/carousel/default-1.svg', alt: 'Bienvenido' },
      { url: 'assets/img/carousel/default-2.svg', alt: 'Nuestros servicios' },
      { url: 'assets/img/carousel/default-3.svg', alt: 'Reserva tu turno' }
    ]
  };

  constructor(private businessConfigService: BusinessConfigService) {}

  ngOnInit(): void {
    // Build carousel images with custom URLs or defaults
    this.carouselImages$ = this.businessConfigService.config$.pipe(
      map(config => this.getCarouselImages(config))
    );
    
    // Get carousel configuration
    this.carouselConfig$ = this.businessConfigService.config$.pipe(
      map(config => ({
        autoPlay: config?.carousel_auto_play !== false, // Default true
        interval: config?.carousel_interval || 5000
      }))
    );
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
  
  /**
   * TrackBy function for ngFor performance
   */
  trackByUrl(index: number, item: CarouselImage): string {
    return item.url;
  }
  
  /**
   * Handle image load errors - fallback to default image
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('default-1.svg')) {
      // Fallback to default image
      img.src = 'assets/img/carousel/default-1.svg';
      img.alt = 'Imagen no disponible';
    }
  }
}
