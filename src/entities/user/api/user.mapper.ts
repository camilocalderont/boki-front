import { User, LoginCredentials, RegisterCredentials } from '../model/user.model';
import {
  BackendUser,
  BackendLoginCredentials,
  BackendRegisterCredentials,
} from './user.dto';

export function toUser(backend: BackendUser): User {
  return {
    id: backend.Id,
    email: backend.VcEmail,
    firstName: backend.VcFirstName,
    firstLastName: backend.VcFirstLastName,
    nickName: backend.VcNickName,
  };
}

export function toBackendLoginCredentials(
  credentials: LoginCredentials,
): BackendLoginCredentials {
  return {
    VcEmail: credentials.email,
    VcPassword: credentials.password,
  };
}

export function toBackendRegisterCredentials(
  credentials: RegisterCredentials,
): BackendRegisterCredentials {
  return {
    VcFirstName: credentials.firstName,
    VcSecondName: credentials.secondName,
    VcFirstLastName: credentials.firstLastName,
    VcSecondLastName: credentials.secondLastName,
    vcNickName: credentials.nickName,
    VcIdentificationNumber: credentials.identificationNumber,
    VcPhone: credentials.phone,
    VcEmail: credentials.email,
    VcPassword: credentials.password,
  };
}
