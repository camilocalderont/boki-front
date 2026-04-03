export interface User {
  id: number;
  email: string;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  nickName?: string;
  phone?: string;
  identificationNumber?: string;
  roles?: { id: number; name: string; code: string }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  nickName: string;
  identificationNumber: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}
