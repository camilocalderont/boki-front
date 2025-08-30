export interface GetCategoryResponse {
    Id: number;
    CompanyId: number;
    VcName: string;
    BIsService: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface PostCategoryRequest {
    CompanyId: number;
    VcName: string;
    BIsService: boolean;
}
