export interface Company {
  id: number;
  name: string;
  description: string;
  phone: string;
  principalAddress: string;
  principalEmail: string;
  legalRepresentative: string;
  userId: number;
  logo: string;
  images: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyPrompt {
  id: number;
  companyId: number;
  description: string;
  internalCode: string;
  intentionPrompt: string;
  mainPrompt: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyRequest {
  VcName: string;
  VcDescription: string;
  VcPhone: string;
  VcPrincipalAddress: string;
  VcPrincipalEmail: string;
  VcLegalRepresentative: string;
  UserId: number;
  TxLogo: string;
  TxImages: string;
  TxPrompt: string;
}

export interface CreateCompanyPromptRequest {
  CompanyId: number;
  VcDescription: string;
  VcInternalCode: string;
  TxIntentionPrompt: string;
  TxMainPrompt: string;
  UserId: number;
}

export type GalleryCategory = 'venue' | 'service' | 'portfolio';

export interface CompanyGalleryImage {
  Id: number;
  CompanyId: number;
  VcCategory: GalleryCategory;
  VcCategoryName?: string;
  ProfessionalId?: number;
  ServiceId?: number;
  VcImageUrl: string;
  VcDescription?: string;
  ISortOrder: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGalleryImageRequest {
  CompanyId: number;
  VcCategory: GalleryCategory;
  VcCategoryName?: string;
  ProfessionalId?: number;
  ServiceId?: number;
  VcImageUrl: string;
  VcDescription?: string;
  ISortOrder?: number;
}

export interface UpdateGalleryImageRequest {
  VcCategory?: GalleryCategory;
  VcCategoryName?: string;
  ProfessionalId?: number;
  ServiceId?: number;
  VcImageUrl?: string;
  VcDescription?: string;
  ISortOrder?: number;
}
