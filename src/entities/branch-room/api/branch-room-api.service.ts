import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse, CustomError } from '@shared/api';
import { BranchRoom, CreateBranchRoomRequest } from '../model/branch-room.model';

@Injectable({ providedIn: 'root' })
export class BranchRoomApiService {
  private readonly baseUrl = `${APP_CONSTANTS.apiBaseUrl}/company-branch-rooms`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiSuccessResponse<BranchRoom[]>> {
    return this.http
      .get<ApiSuccessResponse<BranchRoom[]>>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<BranchRoom>> {
    return this.http
      .get<ApiSuccessResponse<BranchRoom>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getByBranch(branchId: number): Observable<ApiSuccessResponse<BranchRoom[]>> {
    return this.http
      .get<ApiSuccessResponse<BranchRoom[]>>(`${this.baseUrl}/branch/${branchId}`)
      .pipe(catchError(this.handleError));
  }

  create(data: CreateBranchRoomRequest): Observable<ApiSuccessResponse<BranchRoom>> {
    return this.http
      .post<ApiSuccessResponse<BranchRoom>>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: Partial<CreateBranchRoomRequest>): Observable<ApiSuccessResponse<BranchRoom>> {
    return this.http
      .put<ApiSuccessResponse<BranchRoom>>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<ApiSuccessResponse<null>> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    return throwError(() => customError);
  }
}
