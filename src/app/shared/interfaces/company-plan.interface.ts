export interface PostCompanyPlanRq {
    CompanyId: number;
    PlanId: number;
}

export interface GetCompanyPlansRs {
    Id: number;
    CompanyId: number;
    PlanId: number;
    created_at: Date;
    updated_at: Date;
}