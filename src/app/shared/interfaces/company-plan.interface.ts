import { GetCompanyPlanControlTokenRs } from "./company-plan-control-token.interface";
import { GetCompanyResponse } from "./company.interface";
import { GetAllPlansRs } from "./plan.interface";

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
    Company: GetCompanyResponse;
    Plan: GetAllPlansRs;
    CompanyPlanControlTokens: GetCompanyPlanControlTokenRs[];
}