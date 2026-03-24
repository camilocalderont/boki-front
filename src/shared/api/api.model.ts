export interface ApiSuccessResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  status: string;
  message: string;
  errors: ApiFieldError[];
}

export interface ApiFieldError {
  code: string;
  message: string;
  field: string;
}

export interface CustomError extends Error {
  code: string;
  status?: number;
  originalError?: unknown;
}
