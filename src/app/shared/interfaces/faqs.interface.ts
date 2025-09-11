import { GetCategoryResponse } from "./category.interface";
import { GetCompanyResponse } from "./company.interface";

export interface GetFaqsResponse {
    Id: number;
    VcQuestion: string;
    VcAnswer: string;
    CompanyId: number;
    CategoryServiceId: number;
    created_at: Date;
    updated_at: Date;
    Company: GetCompanyResponse;
    CategoryService: GetCategoryResponse;
}

export interface PostFaqsRequest {
    VcQuestion: string;
    VcAnswer: string;
    CompanyId: number;
    CategoryServiceId: number;
}
