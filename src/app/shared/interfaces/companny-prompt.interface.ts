import { GetCompanyResponse, GetUserResponse } from "./company.interface";

export interface PostCompanyPrompt {
    CompanyId: number;
    VcDescription: string;
    VcInternalCode: string;
    TxIntentionPrompt: string;
    TxMainPrompt: string;
    UserId: number;
}

export interface GetCompanyPrompt {
    Id: number;
    CompanyId: number;
    VcDescription: string;
    VcInternalCode: string;
    TxIntentionPrompt: string;
    TxMainPrompt: string;
    UserId: number;
    created_at: Date;
    updated_at: Date;
    Company: GetCompanyResponse;
    User: GetUserResponse;
}
