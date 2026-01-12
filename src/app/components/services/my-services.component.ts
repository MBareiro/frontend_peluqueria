import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ServicesService, EmployeeServiceEntry } from '../../services/services.service';
import { Service } from '../../models/service.model';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-services',
  templateUrl: './my-services.component.html',
  styleUrls: ['./my-services.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyServicesComponent implements OnInit {
  services: Service[] = [];
  employeeId: number | null = null;
  loading = false;
  offeringMap: Record<number, boolean> = {}; // service_id -> offered

  constructor(
    private servicesService: ServicesService, 
    private userService: UserService, 
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.employeeId = this.userService.verifyIdUser();
    await this.load();
    if (this.employeeId) await this.loadOfferings();
    this.cdr.markForCheck();
  }

  async load() {
    this.loading = true;
    try {
      const data: any = await firstValueFrom(this.servicesService.list());
      this.services = data || [];
      this.cdr.markForCheck();
    } catch (error) {
      this.snackBar.open('Error al cargar servicios', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async loadOfferings() {
    try {
      // call backend to list employees for each service and mark offered
      for (const svc of this.services) {
        const entries = await firstValueFrom(this.servicesService.listBarbersForService(svc.id!));
        const exists = (entries || []).some((e: any) => Number(e.employee_id) === this.employeeId);
        this.offeringMap[svc.id as number] = exists;
      }
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Error loading offerings', err);
    }
  }

  async toggle(svc: Service) {
    if (!this.employeeId) return alert('No user id available');
    if (!svc.active) {
      // Prevent employees from offering a globally inactive service
      this.snackBar.open('Este servicio no está disponible en el local', 'Cerrar', { duration: 3000 });
      return;
    }
    const offeredNow = !this.offeringMap[svc.id as number];
    try {
      // upsert entry
      const payload: any = { service_id: svc.id, employee_id: this.employeeId, offered: offeredNow, price: svc.cost, duration: svc.duration };
      await firstValueFrom(this.servicesService.upsertBarberService(payload));
      this.offeringMap[svc.id as number] = offeredNow;
      this.cdr.markForCheck();
      this.snackBar.open(`${svc.description} ${offeredNow ? 'marcado como ofrecido' : 'desmarcado'}`, 'Cerrar', { duration: 2500 });
    } catch (err) {
      this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
    }
  }

  getIconForService(s: Service): string {
    const desc = (s.description || '').toLowerCase();
    if (desc.includes('corte')) return 'content_cut';
    if (desc.includes('tinte') || desc.includes('color')) return 'brush';
    if (desc.includes('afeitado') || desc.includes('barba')) return 'face';
    if (desc.includes('peinado') || desc.includes('peinar')) return 'style';
    if (desc.includes('manic') || desc.includes('uñ')) return 'handshake';
    return 'miscellaneous_services';
  }

  isOffered(svc: Service): boolean {
    const id = svc.id ?? null;
    if (id === null) return false;
    return !!this.offeringMap[id];
  }

  trackById = (_: number, s: Service) => s.id;
}