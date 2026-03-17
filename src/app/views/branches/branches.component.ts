import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyBranchService, CompanyBranch } from '../../services/company-branch.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-branches',
  imports: [
    CommonModule,
    DataGridComponent,
    ThemeComponentsModule,
  ],
  templateUrl: './branches.component.html',
})
export class BranchesComponent extends BaseComponent {
  branches: CompanyBranch[] = [];

  branchColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcAddress', label: 'Dirección' },
    { key: 'VcEmail', label: 'Correo Electrónico' },
    { key: 'VcPhone', label: 'Teléfono' },
    { key: 'BIsPrincipal', label: 'Principal', format: FORMAT_DATA.BOOL },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private companyBranchService: CompanyBranchService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.companyBranchService.getAll().subscribe({
      next: (response: ApiSuccessResponse<CompanyBranch[]>) => {
        this.branches = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading branches:', error);
      },
    });
  }

  createBranch(): void {
    this.router.navigate(['/dashboard/branches/create']);
  }

  updateBranch(id: number): void {
    this.router.navigate(['/dashboard/branches/update', id]);
  }
}
