// src/app/shared/interfaces/auth.interface.ts

// ========================================
// INTERFACES PARA COMUNICACIÓN CON BACKEND
// ========================================

export interface BackendLoginCredentials {
  VcEmail: string;
  VcPassword: string;
}

export interface BackendLoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: {
      Id: number;
      VcEmail: string;
      VcFirstName: string;
      VcFirstLastName: string;
      VcNickName?: string;
    };
  };
}

// ========================================
// INTERFACES PARA FRONTEND
// ========================================

export interface LoginCredentials {
  email: string;
  password: string;
}