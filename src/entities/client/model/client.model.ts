export interface Client {
  Id: number;
  CompanyId: number;
  VcIdentificationNumber: string;
  VcPhone: string;
  VcFirstName: string;
  VcSecondName: string;
  VcFirstLastName: string;
  VcSecondLastName: string;
  VcNickName: string;
  VcEmail: string;
}

export interface CreateClientRequest {
  CompanyId: number;
  VcIdentificationNumber: string;
  VcPhone: string;
  VcFirstName: string;
  VcSecondName?: string;
  VcFirstLastName: string;
  VcSecondLastName?: string;
  VcNickName?: string;
  VcEmail?: string;
}
