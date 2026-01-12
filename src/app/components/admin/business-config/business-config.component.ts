import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessConfigService } from '../../../services/business-config.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BusinessConfig, BusinessTypePreset } from '../../../models/business-config.model';

@Component({
  selector: 'app-business-config',
  templateUrl: './business-config.component.html',
  styleUrls: ['./business-config.component.css']
})
export class BusinessConfigComponent implements OnInit {
  configForm!: FormGroup;
  loading = false;
  presets: Record<string, BusinessTypePreset> = {};
  currentConfig: BusinessConfig | null = null;

  businessTypes = [
    { value: 'barbershop', label: 'Barbería', icon: '💈' },
    { value: 'beauty_salon', label: 'Salón de Belleza', icon: '✨' },
    { value: 'nails', label: 'Manicura/Pedicura', icon: '💅' },
    { value: 'spa', label: 'Spa', icon: '🧖' },
    { value: 'massage', label: 'Masajes', icon: '💆' },
    { value: 'tattoo', label: 'Tatuajes', icon: '🎨' },
    { value: 'other', label: 'Otro', icon: '📅' }
  ];

  constructor(
    private fb: FormBuilder,
    private businessConfigService: BusinessConfigService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.initForm();
    await this.loadConfig();
    await this.loadPresets();
  }

  initForm() {
    this.configForm = this.fb.group({
      business_name: ['Mi Negocio', Validators.required],
      business_type: ['other', Validators.required],
      employee_label_singular: ['Profesional', Validators.required],
      employee_label_plural: ['Profesionales', Validators.required],
      service_label_singular: ['Servicio', Validators.required],
      service_label_plural: ['Servicios', Validators.required],
      appointment_label: ['Turno', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
      website: [''],
      logo_url: [''],
      primary_color: ['#1976d2', Validators.required],
      secondary_color: ['#0d47a1', Validators.required],
      email_signature: ['¡Te esperamos!'],
      home_tagline: ['Tu lugar de confianza'],
      home_description: [''],
      carousel_image_1: [''],
      carousel_image_2: [''],
      carousel_image_3: [''],
      carousel_auto_play: [true],
      carousel_interval: [5000, [Validators.min(1000), Validators.max(30000)]],
      facebook_url: [''],
      instagram_url: [''],
      twitter_url: ['']
    });

    // Listener para cambios en business_type
    this.configForm.get('business_type')?.valueChanges.subscribe(type => {
      this.applyPreset(type);
    });
  }

  async loadConfig() {
    this.loading = true;
    try {
      this.currentConfig = await this.businessConfigService.loadConfig();
      if (this.currentConfig) {
        this.configForm.patchValue(this.currentConfig);
      }
    } catch (error) {
      this.notificationService.showError('Error al cargar la configuración');
    } finally {
      this.loading = false;
    }
  }

  async loadPresets() {
    try {
      this.presets = await this.businessConfigService.getBusinessTypePresets().toPromise() || {};
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  }

  applyPreset(type: string) {
    const preset = this.presets[type];
    if (preset) {
      this.configForm.patchValue({
        employee_label_singular: preset.employee_label_singular,
        employee_label_plural: preset.employee_label_plural,
        service_label_singular: preset.service_label_singular || 'Servicio',
        service_label_plural: preset.service_label_plural || 'Servicios',
        appointment_label: preset.appointment_label
      });
    }
  }

  async onSubmit() {
    if (this.configForm.invalid) {
      this.notificationService.showWarning('Por favor completa los campos requeridos');
      return;
    }

    this.loading = true;
    try {
      await this.businessConfigService.updateConfig(this.configForm.value).toPromise();
      this.notificationService.showSuccess('Configuración actualizada correctamente');
      
      // Recargar para reflejar cambios
      await this.loadConfig();
    } catch (error: any) {
      this.notificationService.showError(
        error?.error?.error || 'Error al actualizar la configuración'
      );
    } finally {
      this.loading = false;
    }
  }

  getBusinessIcon(type: string): string {
    return this.businessConfigService.getBusinessIcon(type);
  }

  resetForm() {
    if (this.currentConfig) {
      this.configForm.patchValue(this.currentConfig);
    }
  }
}
