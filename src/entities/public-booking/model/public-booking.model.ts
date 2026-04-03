export interface PublicCompany {
  Id: number;
  VcName: string;
  VcSlug: string;
  VcDescription?: string;
  VcPhone?: string;
  VcPrincipalAddress?: string;
  VcPrincipalEmail: string;
  TxLogo?: string;
  TxImages?: string;
  IFrequencyScheduling: number;
  BSubscriptionActive: boolean;
  BranchAddress?: string;
}

export interface PublicService {
  Id: number;
  VcName: string;
  VcDescription?: string;
  IMinimalPrice: number;
  IMaximalPrice: number;
  IRegularPrice: number;
  DTaxes: number;
  VcTime: string;
  TxPicture?: string;
  CategoryId: number;
  CategoryName: string;
}

export interface PublicCategory {
  Id: number;
  VcName: string;
  ServiceCount: number;
}

export interface PublicProfessional {
  Id: number;
  VcFirstName: string;
  VcFirstLastName: string;
  VcProfession: string;
  VcSpecialization?: string;
  TxPhoto?: string;
  IYearsOfExperience: number;
}

export interface CreatePublicAppointmentDto {
  ServiceId: number;
  ProfessionalId?: number;
  DtDate: string;
  TStartTime: string;
  ClientFirstName: string;
  ClientLastName: string;
  ClientEmail: string;
  ClientPhone: string;
  VcBookingNotes?: string;
}

export interface PublicAppointment {
  Id: number;
  VcPublicToken: string;
  DtDate: string;
  TStartTime: string;
  TEndTime: string;
  VcBookingNotes?: string;
  Service: { Id: number; VcName: string; VcTime: string; IMinimalPrice: number };
  Professional: { Id: number; VcFirstName: string; VcFirstLastName: string; VcProfession: string; TxPhoto?: string };
  Client: { VcFirstName: string; VcFirstLastName: string; VcEmail: string; VcPhone: string };
  CurrentState: { Id: number; VcName: string };
}

export interface ClientProfile {
  Id: number;
  VcFirstName: string;
  VcFirstLastName: string;
  VcEmail?: string;
  VcPhone?: string;
  BWhatsappNotifications: boolean;
  BEmailNotifications: boolean;
}

export interface ClientSettings {
  BWhatsappNotifications: boolean;
  BEmailNotifications: boolean;
}

export interface ClientAppointmentHistory {
  Id: number;
  DtDate: string;
  TStartTime: string;
  TEndTime: string;
  VcPublicToken: string;
  Service: { VcName: string; VcTime: string; IMinimalPrice: number };
  Professional: { VcFirstName: string; VcFirstLastName: string };
  CurrentState: { VcName: string };
}

export interface GalleryImage {
  Id: number;
  CompanyId: number;
  VcCategory: 'venue' | 'service' | 'portfolio';
  VcCategoryName?: string;
  ProfessionalId?: number;
  ServiceId?: number;
  VcImageUrl: string;
  VcDescription?: string;
  ISortOrder: number;
  Professional?: { VcFirstName: string; VcFirstLastName: string; TxPhoto?: string };
}
