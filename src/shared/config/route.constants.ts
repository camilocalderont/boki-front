export const ROUTES = {
  AUTH: {
    ROOT: 'auth',
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
  },
  ONBOARDING: {
    START: 'auth/onboarding/start',
    WIZARD: 'auth/onboarding',
  },
  DASHBOARD: {
    ROOT: 'dashboard',
    COMPANY: 'dashboard/company',
    CATALOG: 'dashboard/catalog',
    PROFESSIONALS: 'dashboard/professionals',
    FAQS: 'dashboard/faqs',
    APPOINTMENTS: 'dashboard/appointments',
    PLANS: 'dashboard/plans',
  },
} as const;
