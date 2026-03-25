import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface FaqFormValue {
  VcQuestion: string;
  VcAnswer: string;
}

export const FAQ_VALIDATORS: Record<keyof FaqFormValue, any[]> = {
  VcQuestion: [Validators.required, Validators.minLength(2), Validators.maxLength(500)],
  VcAnswer:   [Validators.required],
};

const FIELD_LABELS: Record<keyof FaqFormValue, string> = {
  VcQuestion: 'Pregunta',
  VcAnswer:   'Respuesta',
};

export function getFaqErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof FaqFormValue
): string {
  return getFormErrorMessage(control, FIELD_LABELS[fieldName]);
}
