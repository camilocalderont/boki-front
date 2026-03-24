export interface Plan {
  id: number;
  valueMonthly: number;
  valueYearly: number;
  time: number;
  maxConversation: number;
  properties: string;
  createdAt: Date;
  updatedAt: Date;
  companyPlans: CompanyPlan[];
}

export interface PlanFeatures {
  features: string[];
  limits: { users: number; storage: string };
}

export interface CompanyPlan {
  id: number;
  companyId: number;
  planId: number;
  createdAt: Date;
  updatedAt: Date;
  controlTokens: ControlToken[];
}

export interface ControlToken {
  id: number;
  companyPlanId: number;
  year: number;
  month: number;
  maxInteractionTokens: number;
  maxConversationTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyPlanRequest {
  CompanyId: number;
  PlanId: number;
}

export interface CreateControlTokenRequest {
  CompanyPlanId: number;
  IYear: number;
  IMonth: number;
  IMaxInteractionTokens: number;
  IMaxConversationTokens: number;
}
