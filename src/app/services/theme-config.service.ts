import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError, map } from 'rxjs';
import { ApiSuccessResponse, CustomError } from '../shared/interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeConfigService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;
  private currentTheme: any = null;
  
  constructor(private http: HttpClient) {
    if (environment.enableDebugMode) {
      console.log('🎨 ThemeConfigService inicializado:', this.baseUrl);
    }
  }

  // Por ahora cargamos el JSON local, luego será una petición real al backend
  getThemeConfig(): Observable<ApiSuccessResponse<any>> {

    const configUrl = 'assets/config/theme-config.json';


    return this.http.get<any>(configUrl).pipe(
      map((themeConfig: any) => {
        const response: ApiSuccessResponse<any> = {
          status: 'ok',
          data: themeConfig,
          message: "Configuración de tema cargada exitosamente"
        };

        // Guardamos la configuración para uso posterior
        this.currentTheme = themeConfig;

        return response;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Método para obtener la configuración ya cargada (sin nueva petición)
  getCurrentTheme(): any {
    return this.currentTheme;
  }

  // Método para verificar si la configuración ya está cargada
  isThemeLoaded(): boolean {
    return this.currentTheme !== null;
  }

  // TODO:este método hará una petición real al backend
  // getThemeConfig(): Observable<ApiSuccessResponse<any>> {
  //   const url = `${this.baseUrl}/theme-config`;
  //   
  //   if (environment.enableDebugMode) {
  //     console.log('🎨 ThemeConfigService - getThemeConfig:', url);
  //   }
  //
  //   return this.http.get<ApiSuccessResponse<any>>(url).pipe(
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido al cargar configuración de tema';
    let errorCode = 'THEME_CONFIG_ERROR';

    if (environment.enableDebugMode) {
      console.error('❌ Error en ThemeConfigService:', error);
    }

    // Error estructurado del backend
    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    }
    // Errores HTTP específicos
    else if (error.status === 404) {
      errorMessage = 'Archivo de configuración de tema no encontrado';
      errorCode = 'THEME_CONFIG_NOT_FOUND';
    }
    else if (error.status === 0) {
      errorMessage = 'Error de conexión al cargar tema';
      errorCode = 'THEME_NETWORK_ERROR';
    } 
    else if (error.status >= 500) {
      errorMessage = 'Error del servidor al cargar tema';
      errorCode = 'THEME_SERVER_ERROR';
    }

    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    customError.originalError = error;

    return throwError(() => customError);
  }
}