export type {
  Company,
  CompanyPrompt,
  CreateCompanyRequest,
  CreateCompanyPromptRequest,
  CompanyGalleryImage,
  CreateGalleryImageRequest,
  UpdateGalleryImageRequest,
  GalleryCategory,
} from './model/company.model';
export type { CompanyFormValue } from './model/company.validators';
export { COMPANY_VALIDATORS, getCompanyErrorMessage } from './model/company.validators';
export type { BranchFormValue } from './model/company-branch.validators';
export { BRANCH_VALIDATORS, getBranchErrorMessage } from './model/company-branch.validators';
export { CompanyApiService } from './api/company-api.service';
export { StorageApiService } from './api/storage-api.service';
export type { StorageUploadResult } from './api/storage-api.service';
