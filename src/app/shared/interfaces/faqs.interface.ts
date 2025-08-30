export interface GetFaqsResponse {
    Id: number;
    VcQuestion: string;
    VcAnswer: string;
    CompanyId: number;
    CategoryServiceId: number;
    created_at: Date;
    updated_at: Date;
}

export interface PostFaqsRequest {
    VcQuestion: string;
    VcAnswer: string;
    CompanyId: number;
    CategoryServiceId: number;
}
