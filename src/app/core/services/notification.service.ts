import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para mostrar notificaciones al usuario.
 * Abstrae SweetAlert2 para evitar duplicación de código y facilitar cambios futuros.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  /**
   * Muestra una notificación de éxito
   * @param message Mensaje principal
   * @param title Título (opcional, default: 'Éxito')
   * @param timer Tiempo en ms antes de auto-cerrar (default: 2500)
   */
  async showSuccess(message: string, title = 'Éxito', timer = 2500): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      icon: 'success',
      title,
      text: message,
      background: '#191c24',
      color: 'white',
      timer,
      showConfirmButton: false
    });
  }

  /**
   * Muestra una notificación de error
   * @param message Mensaje de error
   * @param title Título (opcional, default: 'Error')
   */
  async showError(message: string, title = 'Error'): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      icon: 'error',
      title,
      text: message,
      background: '#191c24',
      color: 'white',
      confirmButtonText: 'Cerrar'
    });
  }

  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje de advertencia
   * @param title Título (opcional, default: 'Advertencia')
   */
  async showWarning(message: string, title = 'Advertencia', timer?: number): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      icon: 'warning',
      title,
      text: message,
      background: '#191c24',
      color: 'white',
      timer,
      showConfirmButton: !timer
    });
  }

  /**
   * Muestra una notificación de información
   * @param message Mensaje informativo
   * @param title Título (opcional, default: 'Información')
   */
  async showInfo(message: string, title = 'Información', timer?: number): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      icon: 'info',
      title,
      text: message,
      background: '#191c24',
      color: 'white',
      timer,
      showConfirmButton: !timer
    });
  }

  /**
   * Muestra un diálogo de confirmación
   * @param title Título del diálogo
   * @param text Texto explicativo
   * @param confirmButtonText Texto del botón de confirmación (default: 'Sí, continuar')
   * @param cancelButtonText Texto del botón de cancelación (default: 'Cancelar')
   * @returns Promise<boolean> - true si el usuario confirma, false si cancela
   */
  async confirmDialog(
    title: string,
    text: string,
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar'
  ): Promise<boolean> {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText
    });
    return result.isConfirmed;
  }

  /**
   * Muestra un diálogo de confirmación para eliminar
   * @param itemName Nombre del item a eliminar
   * @returns Promise<boolean> - true si el usuario confirma
   */
  async confirmDelete(itemName: string): Promise<boolean> {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará permanentemente "${itemName}". ¡No podrás revertir esto!`,
      icon: 'warning',
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  }

  /**
   * Muestra un input dialog para capturar texto del usuario
   * @param title Título del diálogo
   * @param text Texto explicativo
   * @param inputPlaceholder Placeholder del input
   * @param validateFn Función de validación (opcional)
   * @returns Promise con el valor ingresado o null si cancela
   */
  async inputDialog(
    title: string,
    text: string,
    inputPlaceholder = '',
    validateFn?: (value: string) => string | null
  ): Promise<string | null> {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title,
      text,
      input: 'text',
      inputPlaceholder,
      background: '#191c24',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: validateFn ? (value) => {
        const error = validateFn(value);
        return error || undefined;
      } : undefined
    });
    
    return result.isConfirmed ? result.value : null;
  }

  /**
   * Muestra un toast (notificación pequeña en una esquina)
   * @param message Mensaje a mostrar
   * @param icon Icono ('success' | 'error' | 'warning' | 'info')
   * @param position Posición del toast
   * @param timer Duración en ms (default: 3000)
   */
  async showToast(
    message: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'info',
    position: 'top' | 'top-start' | 'top-end' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end',
    timer = 3000
  ): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    await Toast.fire({
      icon,
      title: message
    });
  }
}
