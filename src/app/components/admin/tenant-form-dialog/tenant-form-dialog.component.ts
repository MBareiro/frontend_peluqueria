import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TenantService } from '../../../services/tenant.service';
import { Tenant, CreateTenantRequest } from '../../../models/tenant.model';

@Component({
  selector: 'app-tenant-form-dialog',
  templateUrl: './tenant-form-dialog.component.html',
  styleUrls: ['./tenant-form-dialog.component.css']
})
export class TenantFormDialogComponent implements OnInit {
  tenantForm: FormGroup;
  mode: 'create' | 'edit';
  tenant?: Tenant;
  loading = false;
  error: string | null = null;

  // Plans removed - all tenants get full access

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    public dialogRef: MatDialogRef<TenantFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', tenant?: Tenant }
  ) {
    this.mode = data.mode;
    this.tenant = data.tenant;

    this.tenantForm = this.fb.group({
      subdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      business_name: ['', Validators.required],
      owner_email: ['', [Validators.required, Validators.email]],
      owner_password: [''],
      owner_name: ['']
    });
  }

  ngOnInit(): void {
    if (this.mode === 'create') {
      this.tenantForm.get('owner_password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.tenantForm.get('owner_name')?.setValidators([Validators.required]);
    } else if (this.tenant) {
      this.tenantForm.patchValue({
        subdomain: this.tenant.subdomain,
        business_name: this.tenant.business_name,
        owner_email: this.tenant.owner_email
      });
      this.tenantForm.get('subdomain')?.disable();
      this.tenantForm.get('owner_email')?.disable();
    }
  }

  onSubmit(): void {
    if (this.tenantForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.mode === 'create') {
      this.createTenant();
    } else {
      this.updateTenant();
    }
  }

  private createTenant(): void {
    const formValue = this.tenantForm.value;
    const request: CreateTenantRequest = {
      subdomain: formValue.subdomain,
      business_name: formValue.business_name,
      owner_email: formValue.owner_email,
      owner_password: formValue.owner_password,
      owner_name: formValue.owner_name,
      plan: 'premium'
    };

    this.tenantService.createTenant(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response.tenant);
      },
      error: (err) => {
        console.error('Error creating tenant:', err);
        this.error = err.error?.error || 'Error al crear el tenant';
        this.loading = false;
      }
    });
  }

  private updateTenant(): void {
    if (!this.tenant) return;

    const formValue = this.tenantForm.getRawValue();
    const updateData = {
      business_name: formValue.business_name
    };

    this.tenantService.updateTenant(this.tenant.id, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response.tenant);
      },
      error: (err) => {
        console.error('Error updating tenant:', err);
        this.error = err.error?.error || 'Error al actualizar el tenant';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.mode === 'create' ? 'Crear Nuevo Tenant' : 'Editar Tenant';
  }

  getSubmitButtonText(): string {
    return this.mode === 'create' ? 'Crear' : 'Actualizar';
  }
}
