import { Validators, AbstractControl } from '@angular/forms';
import { getFormErrorMessage } from '@shared/lib';

export interface CompanyFormValue {
  VcName: string;
  VcNit: string;
  VcPrincipalEmail: string;
  VcPhone: string;
  VcPrincipalAddress: string;
  VcLegalRepresentative: string;
  VcDescription: string;
}

export const COMPANY_VALIDATORS: Record<keyof CompanyFormValue, any[]> = {
  VcName:                [Validators.required],
  VcNit:                 [],
  VcPrincipalEmail:      [Validators.email],
  VcPhone:               [],
  VcPrincipalAddress:    [],
  VcLegalRepresentative: [],
  VcDescription:         [],
};

const FIELD_LABELS: Record<keyof CompanyFormValue, string> = {
  VcName:                'Nombre',
  VcNit:                 'NIT',
  VcPrincipalEmail:      'Email',
  VcPhone:               'Teléfono',
  VcPrincipalAddress:    'Dirección',
  VcLegalRepresentative: 'Representante legal',
  VcDescription:         'Descripción',
};

export function getCompanyErrorMessage(
  control: AbstractControl | null,
  fieldName: keyof CompanyFormValue
): string {
  return getFormErrorMessage(control, FIELD_LABELS[fieldName]);
}
