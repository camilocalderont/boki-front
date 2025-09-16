export interface GetAllPlansRs {
    Id: number;
    IValueMonthly: number;
    IValueYearly: number;
    ITime: number;
    IMaxConversation: number;
    TxProperties: string;
    created_at: Date;
    updated_at: Date;
    CompanyPlans: [];
}

export interface PlanFeatures {
  features: string[];
  limits: {
    users: number;
    storage: string;
  };
}