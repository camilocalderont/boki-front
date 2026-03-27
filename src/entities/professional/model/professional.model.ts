export interface Professional {
  Id: number;
  VcFirstName: string;
  VcSecondName?: string;
  VcFirstLastName: string;
  VcSecondLastName?: string;
  VcEmail: string;
  VcPhone?: string;
  VcIdentificationNumber: string;
  VcLicenseNumber?: string;
  IYearsOfExperience: number;
  TxPhoto?: string;
  VcProfession: string;
  VcSpecialization?: string;
  CompanyId: number;
  Company?: { Id: number; VcName: string };
  Services?: ProfessionalServiceRel[];
  BussinessHours?: ProfessionalBussinessHour[];
  created_at: string;
  updated_at: string;
}

export interface ProfessionalServiceRel {
  Id: number;
  ProfessionalId: number;
  ServiceId: number;
  Service?: { Id: number; VcName: string };
}

export interface ProfessionalBussinessHour {
  Id?: number;
  ProfessionalId?: number;
  IDayOfWeek: number;
  TStartTime: string;
  TEndTime: string;
  TBreakStartTime?: string;
  TBreakEndTime?: string;
  VcNotes?: string;
  CompanyBranchRoomId: number;
  CompanyBranchRoom?: { Id: number; VcNumber: string };
}

export interface CreateProfessionalRequest {
  VcFirstName: string;
  VcSecondName?: string;
  VcFirstLastName: string;
  VcSecondLastName?: string;
  VcEmail: string;
  VcPhone?: string;
  VcIdentificationNumber: string;
  VcLicenseNumber?: string;
  IYearsOfExperience?: number;
  TxPhoto?: string;
  VcProfession: string;
  VcSpecialization?: string;
  CompanyId: number;
  Services?: { ServiceId: number }[];
  BussinessHours?: Omit<ProfessionalBussinessHour, 'Id' | 'ProfessionalId' | 'CompanyBranchRoom'>[];
}
