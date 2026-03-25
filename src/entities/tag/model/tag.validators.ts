import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface TagFormValue {
  VcName: string;
}

export const TAG_VALIDATORS: Record<keyof TagFormValue, any[]> = {
  VcName: [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
};

const FIELD_LABELS: Record<keyof TagFormValue, string> = {
  VcName: 'Nombre',
};

export function getTagErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof TagFormValue
): string {
  return getFormErrorMessage(control, FIELD_LABELS[fieldName]);
}
