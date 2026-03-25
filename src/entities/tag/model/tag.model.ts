export interface Tag {
  Id: number;
  VcName: string;
  CompanyId: number;
  Company?: { Id: number; VcName: string };
  created_at: Date;
  updated_at: Date;
}

export interface CreateTagRequest {
  VcName: string;
  CompanyId: number;
}
