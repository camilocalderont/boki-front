export interface BackendLoginCredentials {
  VcEmail: string;
  VcPassword: string;
}

export interface BackendLoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: BackendUser;
  };
}

export interface BackendUser {
  Id: number;
  VcEmail: string;
  VcFirstName: string;
  VcFirstLastName: string;
  VcNickName?: string;
}

export interface BackendRegisterCredentials {
  VcIdentificationNumber: string;
  VcPhone: string;
  vcNickName: string;
  VcFirstName: string;
  VcSecondName?: string;
  VcFirstLastName: string;
  VcSecondLastName?: string;
  VcEmail: string;
  VcPassword: string;
}

export interface BackendRegisterResponse {
  status: string;
  message: string;
  data: {
    Id: number;
    VcIdentificationNumber: string;
    VcPhone: string;
    VcNickName: string | null;
    VcFirstName: string;
    VcSecondName: string | null;
    VcFirstLastName: string;
    VcSecondLastName: string | null;
    VcEmail: string;
    VcPassword: string;
    created_at: string;
    updated_at: string;
  };
}
