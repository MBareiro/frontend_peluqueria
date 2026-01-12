import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServicesService } from '../../services/services.service';
import { Service } from '../../models/service.model';
import { AuthService } from '../../services/auth.service';

type DialogData = { service?: Service } | null;

@Component({
  selector: 'app-service-create-dialog',
  templateUrl: './service-create-dialog.component.html',
  styleUrls: ['./service-create-dialog.component.css']
})
export class ServiceCreateDialogComponent {
  saving = false;
  error: string | null = null;
  isEdit = !!this.data?.service;
  isOwner: boolean = false;

  form = this.fb.group({
    description: [this.data?.service?.description ?? '', Validators.required],
    duration: [this.data?.service?.duration ?? 30, [Validators.required, Validators.min(1)]],
    cost: [this.data?.service?.cost ?? 0, [Validators.required, Validators.min(0)]],
    active: [this.data?.service?.active ?? true],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceCreateDialogComponent>,
    private servicesService: ServicesService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    // Subscribe to auth state to determine if current user is owner
    this.authService.currentUser$.subscribe(user => {
      this.isOwner = !!(user && (user.role_obj?.name || user.role) === 'owner');
      if (!this.isOwner) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    this.error = null;

    const payload: Partial<Service> = this.form.value as any;

    // Si es edición => update(id, payload parcial). Si no => create(payload completo).
    if (!this.isOwner) {
      this.error = 'Only owner can update global services';
      this.saving = false;
      return;
    }

    const obs = this.isEdit && this.data?.service?.id
      ? this.servicesService.update(this.data.service.id, payload)
      : this.servicesService.create(payload as Service);

    obs.subscribe({
      next: (result: Service) => this.dialogRef.close(result),
      error: (err) => {
        this.error = typeof err === 'string' ? err : (err?.message || 'Error al guardar');
        this.saving = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
