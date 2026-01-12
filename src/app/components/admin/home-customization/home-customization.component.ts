import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessConfigService } from '../../../services/business-config.service';
import { BusinessConfig } from '../../../models/business-config.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-customization',
  templateUrl: './home-customization.component.html',
  styleUrls: ['./home-customization.component.css']
})
export class HomeCustomizationComponent implements OnInit {
  customizationForm!: FormGroup;
  config: BusinessConfig | null = null;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private businessConfigService: BusinessConfigService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadConfig();
  }

  initForm(): void {
    this.customizationForm = this.fb.group({
      // Hero Section
      hero_title: ['Bienvenido', [Validators.maxLength(200)]],
      hero_subtitle: ['Reserva tu turno online', [Validators.maxLength(500)]],
      hero_button_text: ['Turno Online', [Validators.maxLength(50)]],
      hero_background_image: [''],
      
      // Welcome Section
      welcome_section_title: ['Bienvenido', [Validators.maxLength(200)]],
      welcome_section_text: [''],
      
      // Section Visibility
      show_services_section: [true],
      show_team_section: [true],
      show_testimonials_section: [false],
      show_map: [true],
      
      // WhatsApp
      whatsapp_number: ['', [Validators.maxLength(30)]],
      show_whatsapp_button: [false],
      
      // Business Hours
      business_hours: [''],
      
      // Carousel
      carousel_auto_play: [true],
      carousel_interval: [5000, [Validators.min(1000), Validators.max(10000)]]
    });
  }

  loadConfig(): void {
    this.loading = true;
    this.businessConfigService.loadConfig()
      .then(() => {
        this.businessConfigService.config$.subscribe(config => {
          if (config) {
            this.config = config;
            this.customizationForm.patchValue({
              hero_title: config.hero_title || 'Bienvenido',
              hero_subtitle: config.hero_subtitle || 'Reserva tu turno online',
              hero_button_text: config.hero_button_text || 'Turno Online',
              hero_background_image: config.hero_background_image || '',
              welcome_section_title: config.welcome_section_title || 'Bienvenido',
              welcome_section_text: config.welcome_section_text || '',
              show_services_section: config.show_services_section !== false,
              show_team_section: config.show_team_section !== false,
              show_testimonials_section: config.show_testimonials_section === true,
              show_map: config.show_map !== false,
              whatsapp_number: config.whatsapp_number || '',
              show_whatsapp_button: config.show_whatsapp_button === true,
              business_hours: config.business_hours || '',
              carousel_auto_play: config.carousel_auto_play !== false,
              carousel_interval: config.carousel_interval || 5000
            });
            this.loading = false;
          }
        });
      })
      .catch(error => {
        console.error('Error cargando configuración:', error);
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la configuración', 'error');
      });
  }

  async onSubmit(): Promise<void> {
    if (this.customizationForm.invalid) {
      Swal.fire('Error', 'Por favor revisa los campos del formulario', 'error');
      return;
    }

    this.saving = true;
    const formData = this.customizationForm.value;

    try {
      await this.businessConfigService.updateConfig(formData);
      await this.businessConfigService.loadConfig();
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'La configuración del home se actualizó correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      Swal.fire({
        title: 'Error',
        text: error.error?.message || 'No se pudo guardar la configuración',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      this.saving = false;
    }
  }

  previewHome(): void {
    window.open('/', '_blank');
  }
}
