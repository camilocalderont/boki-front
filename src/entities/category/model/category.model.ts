export interface Category {
  Id: number;
  CompanyId: number;
  VcName: string;
  BIsService: boolean;
  Company?: { Id: number; VcName: string };
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryRequest {
  CompanyId: number;
  VcName: string;
  BIsService: boolean;
}
