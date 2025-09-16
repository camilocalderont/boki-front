export interface PostCompanyPlanControlTokenRq {
    CompanyPlanId: number;
    IYear: number;
    IMonth: number;
    IMaxInteractionTokens: number;
    IMaxConversationTokens: number;
}

export interface GetCompanyPlanControlTokenRs {
    Id: number;
    CompanyPlanId: number;
    IYear: number;
    IMonth: number;
    IMaxInteractionTokens: number;
    IMaxConversationTokens: number;
    created_at: Date;
    updated_at: Date;
}