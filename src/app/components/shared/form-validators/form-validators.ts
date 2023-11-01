import { AbstractControl, Validators } from '@angular/forms';

export class FormValidators {
  static nameValidator(control: AbstractControl): { [key: string]: any } | null {
    const valid = /^[a-zA-Z ]+$/.test(control.value);
    return valid ? null : { invalidName: true };
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    // Verifica si el carácter es una letra o un espacio
    const isAllowedChar = /[a-zA-Z ]/.test(event.key);
    if (event.key === ' ' && /\s{2,}/.test(inputValue)) {
      event.preventDefault(); // Evita escribir más de un espacio consecutivo
    }
    if (!isAllowedChar) {
      event.preventDefault(); // Evita que se escriban caracteres no permitidos
    }
  }

  onlyNumbers(event: KeyboardEvent): void {
    const isNumber = /^\d+$/.test(event.key);
    // Permitir el uso de teclas de retroceso, suprimir, flechas izquierda, derecha y la tecla Tab
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Tab') {
      return;
    }
    if (!isNumber) {
      event.preventDefault(); // Evita que se escriban caracteres que no sean números
    }
  }
  

  allowAlphanumeric(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
  
     // Verifica si el carácter es alfanumérico (letra, número o espacio)
  const isAllowedChar = /[a-zA-Z0-9 ]/.test(event.key);

  if (!isAllowedChar) {
    event.preventDefault(); // Evita que se escriban caracteres no permitidos
  }

  // Verifica si el carácter es un espacio y si hay espacios consecutivos
  if (event.key === ' ' && /\s{2,}/.test(inputValue)) {
    event.preventDefault(); // Evita escribir más de un espacio consecutivo
  }
  }
}
