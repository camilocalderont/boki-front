import { GetCompanyResponse } from "./company.interface";

export interface GetCategoryResponse {
    Id: number;
    CompanyId: number;
    VcName: string;
    BIsService: boolean;
    created_at: Date;
    updated_at: Date;
    Company: GetCompanyResponse;
}

export interface PostCategoryRequest {
    CompanyId: number;
    VcName: string;
    BIsService: boolean;
}
