import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface ServiceFormValue {
  VcName: string;
  VcDescription: string;
  IMinimalPrice: number;
  IMaximalPrice: number;
  IRegularPrice: number;
  VcTime: string;
}

export const SERVICE_VALIDATORS: Record<keyof ServiceFormValue, any[]> = {
  VcName:        [Validators.required],
  VcDescription: [],
  IMinimalPrice: [Validators.required, Validators.min(0)],
  IMaximalPrice: [Validators.required, Validators.min(0)],
  IRegularPrice: [Validators.required, Validators.min(0)],
  VcTime:        [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)],
};

const FIELD_LABELS: Record<keyof ServiceFormValue, string> = {
  VcName:        'Nombre',
  VcDescription: 'Descripción',
  IMinimalPrice: 'Precio mínimo',
  IMaximalPrice: 'Precio máximo',
  IRegularPrice: 'Precio regular',
  VcTime:        'Duración',
};

export function getServiceErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof ServiceFormValue
): string {
  return getFormErrorMessage(control, FIELD_LABELS[fieldName]);
}
