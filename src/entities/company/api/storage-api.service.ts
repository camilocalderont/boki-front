import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';
import { ApiSuccessResponse } from '@shared/api';

export interface StorageUploadResult {
  key: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StorageApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = APP_CONSTANTS.apiBaseUrl;

  /**
   * Sube un archivo a MinIO.
   * @param file   Archivo seleccionado por el usuario
   * @param folder Carpeta dentro del bucket (ej: "company-goldennailsspa/gallery")
   * @returns key (para guardar en DB) + url (para preview inmediato)
   */
  upload(file: File, folder: string): Observable<ApiSuccessResponse<StorageUploadResult>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiSuccessResponse<StorageUploadResult>>(
      `${this.baseUrl}/storage/upload?folder=${encodeURIComponent(folder)}`,
      formData,
    );
  }
}
