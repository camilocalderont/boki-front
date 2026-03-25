export interface Faq {
  Id: number;
  VcQuestion: string;
  VcAnswer: string;
  CompanyId: number;
  CategoryServiceId: number;
  Company?: { Id: number; VcName: string };
  CategoryService?: { Id: number; VcName: string };
  FaqsTags?: { Id: number; TagsId: number; Tag?: { Id: number; VcName: string } }[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateFaqRequest {
  VcQuestion: string;
  VcAnswer: string;
  CompanyId: number;
  CategoryServiceId: number;
  TagIds?: number[];
}
