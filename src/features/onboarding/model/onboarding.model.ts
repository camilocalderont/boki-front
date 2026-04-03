export interface OnboardingInitiateRequest {
  VcEmail: string;
}

export interface OnboardingInitiateResponse {
  token: string;
}

export interface OnboardingValidateResponse {
  VcStatus: string;
  ICurrentStep: number;
  VcEmail: string;
}

export interface OnboardingStep1Request {
  VcFirstName: string;
  VcFirstLastName: string;
  VcIdentificationNumber: string;
  VcPhone: string;
  VcEmail: string;
  VcPassword: string;
  VcSecondName?: string;
  VcSecondLastName?: string;
  VcNickName?: string;
}

export interface OnboardingStep1Response {
  token: string;
  user: { Id: number; VcEmail: string; VcFirstName: string };
}

export interface OnboardingStep2Request {
  VcName: string;
  VcPrincipalEmail: string;
  VcPhone?: string;
  VcPrincipalAddress?: string;
  VcDescription?: string;
  VcLegalRepresentative?: string;
  VcBranchName?: string;
  VcBranchAddress?: string;
  VcRoomNumber?: string;
}

export interface OnboardingStep3Request {
  SolerciaServiceTypeIds: number[];
  VcIndustryTemplate?: string;
}

export interface OnboardingStep4Request {
  PlanId: number;
  VcBillingCycle?: string;
}

export interface SolerciaServiceType {
  Id: number;
  VcName: string;
  VcDisplayName: string;
  VcDescription: string;
  VcIcon: string;
  BIsActive: boolean;
  ISortOrder: number;
}

export interface Plan {
  Id: number;
  VcName: string;
  VcSlug: string;
  VcDescription: string;
  IValueMonthly: number;
  IValueYearly: number;
  ITime: number;
  IMaxConversation: number;
  TxProperties: string;
  BIsActive: boolean;
}
