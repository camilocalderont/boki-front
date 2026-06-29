export interface Appointment {
  Id: number;
  ClientId: number;
  ServiceId: number;
  ProfessionalId: number;
  DtDate: string;
  TStartTime: string;
  TEndTime: string;
  CurrentStateId: number;
  DtCreatedAt: string;
  DtUpdatedAt: string;
  Client?: {
    Id: number;
    VcFirstName: string;
    VcFirstLastName: string;
    VcPhone: string;
    VcIdentificationNumber: string;
  };
  VcBookingNotes?: string;
  Service?: {
    Id: number;
    VcName: string;
    IRegularPrice: number;
    VcTime: string;
    ServiceStages?: {
      Id: number;
      ISequence: number;
      IDurationMinutes: number;
      VcDescription?: string;
      BIsProfessionalBussy: boolean;
    }[];
  };
  Professional?: {
    Id: number;
    VcFirstName: string;
    VcFirstLastName: string;
    VcSpecialization: string;
    VcEmail?: string;
    VcPhone?: string;
  };
  CurrentState?: {
    Id: number;
    VcName: string;
  };
}

export interface AvailableSlots {
  manana: string[];
  tarde: string[];
  noche: string[];
  mensaje?: string;
}

export interface AppointmentState {
  Id: number;
  VcName: string;
}

export interface CreateAppointmentRequest {
  ClientId: number;
  ServiceId: number;
  ProfessionalId: number;
  DtDate: string;
  TStartTime: string;
  CurrentStateId: number;
}

export interface UpdateAppointmentRequest {
  ClientId?: number;
  ServiceId?: number;
  ProfessionalId?: number;
  DtDate?: string;
  TStartTime?: string;
  CurrentStateId?: number;
}

export interface ChangeStateRequest {
  CurrentStateId: number;
}
