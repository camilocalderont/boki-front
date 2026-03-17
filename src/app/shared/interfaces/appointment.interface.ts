export interface Appointment {
  Id: number;
  ClientId: number;
  ServiceId: number;
  ProfessionalId: number;
  DtDate: string;
  TStartTime: string;
  TEndTime: string;
  CurrentStateId: number;
  BIsCompleted: boolean;
  BIsAbsent: boolean;
  DtCreatedAt: string;
  DtUpdatedAt: string;
  Client?: {
    Id: number;
    VcFirstName: string;
    VcFirstLastName: string;
    VcPhone: string;
    VcIdentificationNumber: string;
  };
  Service?: {
    Id: number;
    VcName: string;
    IRegularPrice: number;
    VcTime: string;
  };
  Professional?: {
    Id: number;
    VcFirstName: string;
    VcFirstLastName: string;
    VcSpecialization: string;
  };
  CurrentState?: {
    Id: number;
    VcName: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlots {
  manana: string[];
  tarde: string[];
  noche: string[];
  mensaje?: string;
}

export interface CreateAppointmentRequest {
  ClientId: number;
  ServiceId: number;
  ProfessionalId: number;
  DtDate: string;
  TStartTime: string;
  CurrentStateId: number;
  BIsCompleted: boolean;
  BIsAbsent: boolean;
}
