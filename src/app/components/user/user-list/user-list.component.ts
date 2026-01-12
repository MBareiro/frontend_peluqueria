import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleService, Role } from '../../../services/role.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser: User[] = [];
  selectedUser: User | null = null;
  currentUserId: number | null = null;
  roles: Role[] = [];

  constructor(
    private userService: UserService, 
    private snackBar: MatSnackBar, 
    private authService: AuthService,
    private notification: NotificationService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Keep an up-to-date id of the logged-in user to adjust list/permissions
    const u = this.authService.currentUserValue;
    this.currentUserId = u?.id ?? null;
    this.authService.currentUser$.subscribe(cu => {
      this.currentUserId = cu?.id ?? null;
      this.cdr.markForCheck();
    });
    this.loadRoles();
    this.chargeUser();
  }

  async loadRoles() {
    this.roles = await this.roleService.getRoles();
    this.cdr.markForCheck();
  }

  async chargeUser() {
    try {
      const getUsers: any = await this.userService.getUsers();
      if (!getUsers.error) {
        // Show all users but annotate current user; do not allow deleting/changing role of yourself here.
        this.users = getUsers || [];
        console.log('Usuarios cargados:', this.users); // Debug
        this.cdr.markForCheck();
      } else {
        console.error('Error en getUsers:', getUsers.error);
        this.snackBar.open('Error al obtener usuarios', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      console.error('Excepción al cargar usuarios:', error);
      this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      this.cdr.markForCheck();
    }
  }

  updateUser(user: User): void {
    this.selectedUser = { ...user }; // Copy the selected user
    this.chargeUser();
  }

  async deleteUser(id_user: number): Promise<void> {
    try {
      const confirmed = await this.notification.confirmDelete('el usuario');
      if (confirmed) {
        await this.userService.deleteUser(id_user);
        await this.notification.showSuccess('El usuario ha sido eliminado.', '¡Eliminado!');
        this.selectedUser = null;
        this.chargeUser();
        this.cdr.markForCheck();
      }
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      
      let errorMsg = 'No se pudo eliminar el usuario';
      
      // Extraer mensaje de error específico
      if (error?.error) {
        if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      // Mensajes específicos según el tipo de error
      if (errorMsg.toLowerCase().includes('recurso no encontrado') || 
          errorMsg.toLowerCase().includes('not found') ||
          errorMsg.toLowerCase().includes('foreign key') || 
          errorMsg.toLowerCase().includes('constraint')) {
        errorMsg = 'No se puede eliminar: el usuario tiene turnos, servicios o datos relacionados. Debe desactivarlo en lugar de eliminarlo.';
      }
      
      this.notification.showError(errorMsg);
    }
  }

  async saveChanges() {
    if (this.selectedUser) {
      try {
        await this.userService.updateUser(this.selectedUser);
        this.selectedUser = null;
        await this.notification.showSuccess('Datos actualizados correctamente');
        this.chargeUser();
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        this.notification.showError('No se pudieron actualizar los datos');
      }
    }
  }

  cancelUpdate(): void {
    this.selectedUser = null;
    this.cdr.markForCheck();
  }

  toggleActive(user: User): void {
    if (user) {
      user.active = !user.active;
      this.cdr.markForCheck();
    }
  }

  // TrackBy function para optimizar *ngFor
  trackByUserId = (_index: number, user: User): number => user.id;

  // Helper para obtener el nombre del rol
  getRoleName(user: User): string {
    return user.role_obj?.name || user.role || 'Sin rol';
  }
}
