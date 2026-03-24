export interface Faq {
  Id: number;
  VcQuestion: string;
  VcAnswer: string;
  CompanyId: number;
  CategoryServiceId: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFaqRequest {
  VcQuestion: string;
  VcAnswer: string;
  CompanyId: number;
  CategoryServiceId: number;
}
