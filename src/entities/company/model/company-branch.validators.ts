import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface BranchFormValue {
  VcName: string;
  VcAddress: string;
  VcEmail: string;
  VcPhone: string;
  VcBranchManagerName: string;
  VcDescription: string;
}

export const BRANCH_VALIDATORS: Record<keyof BranchFormValue, any[]> = {
  VcName:              [Validators.required],
  VcAddress:           [Validators.required],
  VcEmail:             [Validators.email],
  VcPhone:             [],
  VcBranchManagerName: [],
  VcDescription:       [],
};

const BRANCH_FIELD_LABELS: Record<keyof BranchFormValue, string> = {
  VcName:              'Nombre de la sede',
  VcAddress:           'Dirección',
  VcEmail:             'Email',
  VcPhone:             'Teléfono',
  VcBranchManagerName: 'Nombre del encargado',
  VcDescription:       'Descripción',
};

export function getBranchErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof BranchFormValue,
): string {
  return getFormErrorMessage(control, BRANCH_FIELD_LABELS[fieldName]);
}
