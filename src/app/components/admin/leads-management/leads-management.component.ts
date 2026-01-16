import { Component, OnInit } from '@angular/core';
import { LeadService, Lead } from '../../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-leads-management',
  templateUrl: './leads-management.component.html',
  styleUrls: ['./leads-management.component.css']
})
export class LeadsManagementComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  isLoading = false;
  
  // Filtros
  selectedStatus = 'all';
  searchTerm = '';
  
  // Estadísticas
  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    rejected: 0
  };

  displayedColumns: string[] = ['created_at', 'business_name', 'email', 'phone', 'status', 'actions'];

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'new', label: 'Nuevos' },
    { value: 'contacted', label: 'Contactados' },
    { value: 'converted', label: 'Convertidos' },
    { value: 'rejected', label: 'Rechazados' }
  ];

  statusLabels: { [key: string]: string } = {
    'new': 'Nuevo',
    'contacted': 'Contactado',
    'converted': 'Convertido',
    'rejected': 'Rechazado'
  };

  constructor(
    private leadService: LeadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading = true;
    
    this.leadService.getAllLeads().subscribe({
      next: (response) => {
        this.leads = response.leads;
        this.filteredLeads = [...this.leads];
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando leads:', error);
        this.snackBar.open('Error al cargar los leads', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter(l => l.status === 'new').length;
    this.stats.contacted = this.leads.filter(l => l.status === 'contacted').length;
    this.stats.converted = this.leads.filter(l => l.status === 'converted').length;
    this.stats.rejected = this.leads.filter(l => l.status === 'rejected').length;
  }

  applyFilters(): void {
    let filtered = [...this.leads];

    // Filtro por estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.selectedStatus);
    }

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.business_name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.phone && lead.phone.includes(term))
      );
    }

    this.filteredLeads = filtered;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateLeadStatus(lead: Lead, newStatus: string): void {
    const previousStatus = lead.status;
    
    this.leadService.updateLeadStatus(lead.id, newStatus).subscribe({
      next: () => {
        lead.status = newStatus as any;
        this.calculateStats();
        this.applyFilters();
        this.snackBar.open('Estado actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'new': 'status-new',
      'contacted': 'status-contacted',
      'converted': 'status-converted',
      'rejected': 'status-rejected'
    };
    return classes[status] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  callPhone(phone: string): void {
    window.location.href = `tel:${phone}`;
  }
}
