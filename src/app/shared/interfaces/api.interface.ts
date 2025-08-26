// ========================================
// INTERFACES PARA MANEJO DE ERRORES
// ========================================

export interface ApiErrorResponse {
  status: string;
  message: string;
  errors: Array<{
    code: string;
    message: string;
    field: string;
  }>;
}

export interface CustomError extends Error {
  code: string;
  status?: number;
  originalError?: any;
}

// ========================================
// INTERFACES PARA RESPUESTAS EXITOSAS
// ========================================

export interface ApiSuccessResponse<T> {
  status: string;
  data: T;
  message?: string;
}