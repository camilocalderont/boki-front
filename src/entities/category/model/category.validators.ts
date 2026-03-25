import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface CategoryFormValue {
  VcName: string;
  BIsService: boolean;
}

export const CATEGORY_VALIDATORS: Record<keyof CategoryFormValue, any[]> = {
  VcName:     [Validators.required],
  BIsService: [],
};

const FIELD_LABELS: Record<keyof CategoryFormValue, string> = {
  VcName:     'Nombre',
  BIsService: 'Es servicio',
};

export function getCategoryErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof CategoryFormValue
): string {
  return getFormErrorMessage(control, FIELD_LABELS[fieldName]);
}
