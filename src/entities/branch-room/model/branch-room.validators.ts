import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface BranchRoomFormValue {
  CompanyBranchId: string;
  VcNumber: string;
  VcFloor: string;
  VcTower: string;
  VcPhone: string;
  VcEmail: string;
  BIsMain: boolean;
}

export const BRANCH_ROOM_VALIDATORS: Record<keyof BranchRoomFormValue, any[]> = {
  CompanyBranchId: [Validators.required],
  VcNumber:        [Validators.required],
  VcFloor:         [],
  VcTower:         [],
  VcPhone:         [],
  VcEmail:         [Validators.email],
  BIsMain:         [],
};

const BRANCH_ROOM_FIELD_LABELS: Record<keyof BranchRoomFormValue, string> = {
  CompanyBranchId: 'Sede',
  VcNumber:        'Número de sala',
  VcFloor:         'Piso',
  VcTower:         'Torre',
  VcPhone:         'Teléfono',
  VcEmail:         'Email',
  BIsMain:         'Sala principal',
};

export function getBranchRoomErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof BranchRoomFormValue,
): string {
  return getFormErrorMessage(control, BRANCH_ROOM_FIELD_LABELS[fieldName]);
}
