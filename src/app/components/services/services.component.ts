import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServicesService } from '../../services/services.service';
import { Service } from '../../models/service.model';
import { ServiceCreateDialogComponent } from '../service-create-dialog/service-create-dialog.component';
import { AuthService } from '../../services/auth.service';
import { BusinessConfigService } from '../../services/business-config.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BusinessConfig } from '../../models/business-config.model';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit, OnDestroy, OnDestroy {
  private destroy$ = new Subject<void>();
  services: Service[] = [];
  loading = false;
  error: string | null = null;
  userRole: string | null = null;
  businessConfig$: Observable<BusinessConfig | null>;

  constructor(
    private servicesService: ServicesService,
    private dialog: MatDialog,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private businessConfigService: BusinessConfigService
  ) {
    this.businessConfig$ = this.businessConfigService.config$;
  }

  ngOnInit(): void {
    // Subscribe to current user and update role-driven UI
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userRole = user?.role_obj?.name || user?.role || null;
        this.cdr.markForCheck();
      });
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIconForService(s: Service): string {
    const desc = (s.description || '').toLowerCase();
    if (desc.includes('corte')) return 'content_cut';
    if (desc.includes('tinte') || desc.includes('color')) return 'format_color_fill';
    if (desc.includes('barba')) return 'face';
    if (desc.includes('pein')) return 'brush';
    if (desc.includes('masaje') || desc.includes('spa')) return 'spa';
    return 'miscellaneous_services';
  }

  loadServices(): void {
    this.loading = true;
    this.error = null;

    this.servicesService.list().subscribe({
      next: (data) => {
        this.services = data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        // Tu handleError devuelve string; por las dudas, normalizo:
        this.error = typeof err === 'string' ? err : (err?.message || 'Error al cargar servicios');
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackById = (_: number, s: Service) => s.id;

  openCreateDialog = (): void => {
    const ref = this.dialog.open(ServiceCreateDialogComponent, {
      width: '520px',
      disableClose: true,
      data: null // creación
    });

    ref.afterClosed().subscribe((created: Service | null) => {
      if (created) {
        // Recargar automáticamente para obtener datos frescos
        this.loadServices();
      }
    });
  }

  openEditDialog(service: Service): void {
    const ref = this.dialog.open(ServiceCreateDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { service } // edición
    });

    ref.afterClosed().subscribe((updated: Service | null) => {
      if (updated) {
        // Recargar automáticamente para obtener datos frescos
        this.loadServices();
      }
    });
  }

  // Toggle active/inactive status
  toggleActive(service: Service): void {
    if (!service?.id) return;

    const newStatus = !service.active;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Desea ${action} "${service.description}"?`)) {
      // Revert toggle visually if user cancels
      return;
    }

    this.loading = true;
    this.error = null;

    this.servicesService.update(service.id, { active: newStatus }).subscribe({
      next: () => {
        service.active = newStatus;
        this.cdr.markForCheck();
      },
      error: (err) => {
        let errorMsg = `Error al ${action} el servicio`;
        
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err?.error) {
          errorMsg = err.error;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        this.error = errorMsg;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Delete service (only if no associations exist)
  delete(service: Service): void {
    if (!service?.id) return;
    
    const confirmMsg = `¿ELIMINAR permanentemente "${service.description}"?\n\nEsta acción NO se puede deshacer.\n\nNOTA: Solo se puede eliminar si el servicio no tiene turnos asociados ni está siendo usado por empleados.\n\nSi tiene datos asociados, considere DESACTIVARLO en su lugar.`;
    if (!confirm(confirmMsg)) return;

    this.loading = true;
    this.error = null;
    
    this.servicesService.delete(service.id).subscribe({
      next: () => {
        // Recargar automáticamente para obtener datos frescos
        this.loadServices();
      },
      error: (err) => {
        let errorMsg = 'Error eliminando el servicio';
        
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err?.error) {
          errorMsg = err.error;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        // Mensajes específicos según el error
        if (errorMsg.toLowerCase().includes('recurso no encontrado') || errorMsg.toLowerCase().includes('not found')) {
          errorMsg = 'No se puede eliminar: el servicio está siendo utilizado por uno o más empleados. Primero debe desvincularse desde "Mis servicios" o considere desactivarlo en su lugar.';
        } else if (errorMsg.toLowerCase().includes('foreign key') || errorMsg.toLowerCase().includes('constraint')) {
          errorMsg = 'No se puede eliminar: el servicio tiene turnos asociados o está siendo usado por empleados. Considere desactivarlo en su lugar.';
        }
        
        this.error = errorMsg;
        this.cdr.markForCheck();
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
