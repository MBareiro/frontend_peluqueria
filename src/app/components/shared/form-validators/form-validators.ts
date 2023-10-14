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
    // Permitir el uso de teclas de retroceso, suprimir y flechas izquierda y derecha
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }
    if (!isNumber) {
      event.preventDefault(); // Evita que se escriban caracteres que no sean números
    }
  }
}
