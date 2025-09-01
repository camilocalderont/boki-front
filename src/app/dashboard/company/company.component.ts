import { Component } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { GetCompanyResponse } from '../../shared/interfaces/company.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-company',
  imports: [
    DataGridComponent,
    ThemeComponentsModule
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
})
export class CompanyComponent extends BaseComponent {
  companies: GetCompanyResponse[] = [];

  columns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'VcPhone', label: 'Número de Teléfono' },
    { key: 'VcPrincipalAddress', label: 'Dirección' },
    { key: 'VcPrincipalEmail', label: 'Correo Electrónico' },
    { key: 'VcLegalRepresentative', label: 'Representante Legal' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
    { key: 'TxPrompt', label: 'Prompt' },
  ];

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadCompanies();
  }

  private loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (response: ApiSuccessResponse<GetCompanyResponse[]>) => {
        console.log('Companies loaded successfully:', response);
        this.companies = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading companies:', error);
      },
    });
  }

  createCompany() {
    this.router.navigate(['/dashboard/companies/create']);
  }

  updateCompany(id: number) {
    this.router.navigate(['/dashboard/companies/update', id]);
  }
}
