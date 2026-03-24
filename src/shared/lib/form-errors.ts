import { AbstractControl } from '@angular/forms';

export type FieldLabels<T extends string = string> = Record<T, string>;

export function getFormErrorMessage(
  control: AbstractControl | null,
  label: string
): string {
  if (!control?.touched || !control.errors) return '';
  const [key, val] = Object.entries(control.errors)[0] as [string, any];
  const messages: Record<string, string> = {
    required:  `${label} es obligatorio`,
    email:     `${label} no tiene formato válido`,
    minlength: `${label} requiere mínimo ${val?.requiredLength} caracteres`,
    maxlength: `${label} no puede superar ${val?.requiredLength} caracteres`,
  };
  return messages[key] ?? `${label}: valor inválido`;
}
