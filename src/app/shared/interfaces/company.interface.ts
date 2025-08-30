export interface GetCompanyResponse {
    Id: number;
    VcName: string;
    VcDescription: string;
    VcPhone: string;
    VcPrincipalAddress: string;
    VcPrincipalEmail: string;
    VcLegalRepresentative: string;
    UserId: number;
    TxLogo: string;
    TxImages: string;
    TxPrompt: string;
    created_at: Date;
    updated_at: Date;
}

export interface PostCompanyRequest {
    VcName: string;
    VcDescription: string;
    VcPhone: string;
    VcPrincipalAddress: string;
    VcPrincipalEmail: string;
    VcLegalRepresentative: string;
    UserId: number;
    TxLogo: string;
    TxImages: string;
    TxPrompt: string;
}

export interface GetUserResponse {
    Id: string;
    VcFirstName: string;
    VcFirstLastName: string;
}