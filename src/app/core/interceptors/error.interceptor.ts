import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

/**
 * Interceptor global para manejo centralizado de errores HTTP.
 * Captura todos los errores de las peticiones HTTP y muestra notificaciones apropiadas.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private notification: NotificationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          errorMessage = this.getServerErrorMessage(error);
          
          // Manejo especial para ciertos códigos de estado
          this.handleSpecialStatusCodes(error.status);
        }

        // Mostrar notificación al usuario (solo si no es un 401 que redirige)
        if (error.status !== 401) {
          this.notification.showError(errorMessage);
        }

        // Log para debugging (solo en desarrollo)
        if (!this.isProduction()) {
          console.error('HTTP Error:', error);
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Extrae el mensaje de error del servidor
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    // Intentar extraer mensaje del error del servidor
    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return typeof error.error.error === 'string' 
          ? error.error.error 
          : error.error.error.message || 'Error del servidor';
      }
    }

    // Mensajes por código de estado
    switch (error.status) {
      case 400:
        return 'Solicitud inválida. Verifica los datos ingresados.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto: el recurso ya existe o está en uso.';
      case 422:
        return 'Datos no procesables. Verifica la información ingresada.';
      case 500:
        return 'Error interno del servidor. Intenta más tarde.';
      case 503:
        return 'Servicio no disponible temporalmente.';
      default:
        return error.message || 'Error desconocido';
    }
  }

  /**
   * Maneja códigos de estado especiales (redireccionamientos, etc.)
   */
  private handleSpecialStatusCodes(status: number): void {
    switch (status) {
      case 401:
        // Solo redirigir al login si NO estamos en una ruta pública
        if (!this.isPublicRoute()) {
          // Usuario no autenticado - redirigir al login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }
        break;
      
      case 403:
        // Usuario sin permisos - redirigir a página de error
        if (!this.isPublicRoute()) {
          this.router.navigate(['/error-page'], {
            queryParams: { error: 'forbidden' }
          });
        }
        break;
    }
  }

  /**
   * Verifica si la ruta actual es pública (no requiere autenticación)
   */
  private isPublicRoute(): boolean {
    const publicRoutes = [
      '/',
      '/login',
      '/landing',
      '/create-appointment',
      '/cancel-appointment',
      '/appointment-cancelled',
      '/forgot-password',
      '/reset-password'
    ];
    
    const currentUrl = this.router.url.split('?')[0]; // Remover query params
    
    // Verificar rutas exactas
    if (publicRoutes.includes(currentUrl)) {
      return true;
    }
    
    // Verificar rutas que comienzan con... (ej: /cancel-appointment/123, /reset-password/token)
    const publicPrefixes = [
      '/cancel-appointment/',
      '/reset-password/'
    ];
    
    return publicPrefixes.some(prefix => currentUrl.startsWith(prefix));
  }

  /**
   * Verifica si estamos en producción
   */
  private isProduction(): boolean {
    // Puedes importar environment si lo prefieres
    return false; // Cambiar según tu configuración
  }
}
