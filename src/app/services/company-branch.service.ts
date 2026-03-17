import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';

export interface CompanyBranch {
  Id: number;
  VcName: string;
  VcAddress: string;
  VcEmail: string;
  VcPhone: string;
  BIsPrincipal: boolean;
  CompanyId: number;
  created_at: string;
  updated_at: string;
  Rooms?: Room[];
}

export interface Room {
  Id: number;
  VcNumber: string;
  VcFloor: string;
  VcTower: string;
  BIsMain: boolean;
  CompanyBranchId: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyBranchService {
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiSuccessResponse<CompanyBranch[]>> {
    return this.http
      .get<ApiSuccessResponse<CompanyBranch[]>>(`${this.baseUrl}/company-branches`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<ApiSuccessResponse<CompanyBranch>> {
    return this.http
      .get<ApiSuccessResponse<CompanyBranch>>(`${this.baseUrl}/company-branches/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllRooms(): Observable<ApiSuccessResponse<Room[]>> {
    return this.http
      .get<ApiSuccessResponse<CompanyBranch[]>>(`${this.baseUrl}/company-branches`)
      .pipe(
        map((res) => {
          const rooms: Room[] = [];
          if (res.data) {
            for (const branch of res.data) {
              if (branch.Rooms && branch.Rooms.length > 0) {
                rooms.push(...branch.Rooms);
              }
            }
          }
          return { ...res, data: rooms } as ApiSuccessResponse<Room[]>;
        }),
        catchError(this.handleError)
      );
  }

  getByCompany(companyId: number): Observable<ApiSuccessResponse<CompanyBranch[]>> {
    return this.http
      .get<ApiSuccessResponse<CompanyBranch[]>>(
        `${this.baseUrl}/company-branches?CompanyId=${companyId}`
      )
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
