import { environment } from '../../environments/environment';

export const APP_CONSTANTS = {
  apiBaseUrl: `${environment.apiUrl}/api/${environment.apiVersion}`,
  appName: environment.appName,
  debugMode: environment.enableDebugMode,
  tokenValidationInterval: environment.tokenValidationInterval,
} as const;
